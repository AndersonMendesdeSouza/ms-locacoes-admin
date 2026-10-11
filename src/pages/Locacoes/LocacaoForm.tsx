import { useState, type FormEvent } from "react";
import { Link, useOutletContext } from "react-router";
import { Save } from "lucide-react";
import FormDialog from "../../components/FormDialog/FormDialog";
import type { ManagementContext, Rental, RentalStatus } from "../../types/management";
import styles from "../../styles/Management.module.css";

type LocacaoFormProps = {
  rental: Rental | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

type RentalFormState = {
  clientId: string;
  service: string;
  date: string;
  value: string;
  status: RentalStatus;
};

const rentalStatuses: RentalStatus[] = ["Pendente", "Em análise", "Confirmado", "Finalizado"];

export default function LocacaoForm({ rental, onClose, onSaved }: LocacaoFormProps) {
  const { clients, rentals, setRentals } = useOutletContext<ManagementContext>();
  const [form, setForm] = useState<RentalFormState>({
    clientId: rental?.clientId ?? "",
    service: rental?.service ?? "",
    date: rental?.date ?? "",
    value: rental ? String(rental.value) : "",
    status: rental?.status ?? "Pendente",
  });
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(form.value);

    if (!clients.some((client) => client.id === form.clientId)) {
      setError("Selecione um cliente cadastrado.");
      return;
    }
    if (!form.service.trim()) {
      setError("Informe o serviço da locação.");
      return;
    }
    if (!form.date || Number.isNaN(new Date(`${form.date}T12:00:00`).getTime())) {
      setError("Informe uma data válida para a locação.");
      return;
    }
    if (!form.value.trim() || !Number.isFinite(value) || value < 0) {
      setError("Informe um valor válido, maior ou igual a zero.");
      return;
    }

    const savedRental: Rental = {
      id: rental?.id ?? `LOC-${String(rentals.length + 1).padStart(3, "0")}`,
      clientId: form.clientId,
      service: form.service.trim(),
      date: form.date,
      value: Number(value.toFixed(2)),
      status: form.status,
    };

    setRentals((current) => {
      if (rental) {
        return current.map((item) => item.id === savedRental.id ? savedRental : item);
      }
      return [...current, savedRental];
    });

    onSaved(rental ? "Locação atualizada." : "Locação cadastrada.");
  }

  return (
    <FormDialog title={rental ? "Editar locação" : "Nova locação"} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          Cliente
          <select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value })} required>
            <option value="" disabled>Selecione um cliente</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
        </label>
        {clients.length === 0 && (
          <p className={styles.error}>
            Cadastre um cliente antes de registrar a locação. <Link to="/clientes">Ir para clientes</Link>
          </p>
        )}
        <label className={styles.field}>
          Serviço
          <input value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })} required maxLength={160} placeholder="Ex.: Palco + Sonorização" />
        </label>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            Data
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          </label>
          <label className={styles.field}>
            Valor (R$)
            <input type="number" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} required min="0" step="0.01" inputMode="decimal" />
          </label>
        </div>
        <label className={styles.field}>
          Status
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as RentalStatus })}>
            {rentalStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.formActions}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancelar</button>
          <button type="submit" className={styles.primaryButton} disabled={clients.length === 0}>
            <Save size={16} aria-hidden="true" /> Salvar locação
          </button>
        </div>
      </form>
    </FormDialog>
  );
}
