import { useState } from "react";
import { Link, useMatch, useNavigate, useOutletContext } from "react-router";
import { CheckCircle2, Pencil, Plus, X } from "lucide-react";
import LocacaoForm from "./LocacaoForm";
import type { ManagementContext, Rental, RentalStatus } from "../../types/management";
import styles from "../../styles/Management.module.css";

const statusStyles: Record<RentalStatus, string> = {
  "Confirmado": styles.success,
  "Pendente": styles.warning,
  "Em análise": styles.info,
  "Finalizado": styles.neutral,
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function Locacoes() {
  const { clients, rentals } = useOutletContext<ManagementContext>();
  const navigate = useNavigate();
  const isNewRental = useMatch("/locacoes/nova") !== null;
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [notice, setNotice] = useState("");

  function closeForm() {
    setEditingRental(null);
    if (isNewRental) {
      navigate("/locacoes", { replace: true });
    }
  }

  function handleSaved(message: string) {
    setNotice(message);
    closeForm();
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>OPERAÇÃO</span>
          <h1>Locações</h1>
          <p>Agendamentos, serviços e situação de cada locação.</p>
        </div>
        <Link to="/locacoes/nova" className={styles.primaryButton}>
          <Plus size={16} aria-hidden="true" /> Nova locação
        </Link>
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>{notice}</span>
          <button type="button" className={styles.iconButton} onClick={() => setNotice("")} aria-label="Fechar aviso" title="Fechar aviso">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <p className={styles.recordCount}>{rentals.length} {rentals.length === 1 ? "locação cadastrada" : "locações cadastradas"}</p>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Locações cadastradas</caption>
          <thead>
            <tr>
              <th scope="col">Código</th><th scope="col">Cliente</th><th scope="col">Serviço</th>
              <th scope="col">Data</th><th scope="col">Valor</th><th scope="col">Status</th><th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const client = clients.find((item) => item.id === rental.clientId);

              return (
                <tr key={rental.id}>
                  <td><span className={styles.code}>{rental.id}</span></td>
                  <td><strong className={styles.name}>{client?.name ?? "Cliente não encontrado"}</strong></td>
                  <td>{rental.service}</td>
                  <td className={styles.nowrap}>{new Date(`${rental.date}T12:00:00`).toLocaleDateString("pt-BR")}</td>
                  <td className={styles.nowrap}>{currency.format(rental.value)}</td>
                  <td><span className={`${styles.status} ${statusStyles[rental.status]}`}>{rental.status}</span></td>
                  <td>
                    <button type="button" className={styles.iconButton} onClick={() => setEditingRental(rental)} aria-label={`Editar locação ${rental.id}`} title="Editar locação">
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rentals.length === 0 && <tr><td colSpan={7} className={styles.empty}>Nenhuma locação cadastrada.</td></tr>}
          </tbody>
        </table>
      </div>

      {(isNewRental || editingRental !== null) && (
        <LocacaoForm
          key={isNewRental ? "new" : editingRental?.id}
          rental={isNewRental ? null : editingRental}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
