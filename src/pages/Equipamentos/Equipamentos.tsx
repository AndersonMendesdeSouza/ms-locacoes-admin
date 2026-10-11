import { useState, type FormEvent } from "react";
import { useOutletContext } from "react-router";
import { CheckCircle2, Pencil, Plus, Save, X } from "lucide-react";
import FormDialog from "../../components/FormDialog/FormDialog";
import type { Equipment, EquipmentStatus, ManagementContext } from "../../types/management";
import styles from "../../styles/Management.module.css";

const equipmentStatuses: EquipmentStatus[] = ["Disponível", "Em manutenção", "Indisponível"];

const statusStyles: Record<EquipmentStatus, string> = {
  "Disponível": styles.success,
  "Em manutenção": styles.warning,
  "Indisponível": styles.neutral,
};

export default function Equipamentos() {
  const { equipment, setEquipment } = useOutletContext<ManagementContext>();
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ name: "", category: "", quantity: "1", status: "Disponível" as EquipmentStatus });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function openCreate() {
    setEditingEquipment(null);
    setForm({ name: "", category: "", quantity: "1", status: "Disponível" });
    setError("");
    setFormOpen(true);
  }

  function openEdit(item: Equipment) {
    setEditingEquipment(item);
    setForm({ name: item.name, category: item.category, quantity: String(item.quantity), status: item.status });
    setError("");
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Number(form.quantity);

    if (!form.name.trim() || !form.category.trim()) {
      setError("Informe o nome e a categoria do equipamento.");
      return;
    }
    if (!form.quantity.trim() || !Number.isSafeInteger(quantity) || quantity < 0) {
      setError("A quantidade deve ser um número inteiro maior ou igual a zero.");
      return;
    }

    const item: Equipment = {
      id: editingEquipment?.id ?? `EQP-${String(equipment.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      category: form.category.trim(),
      quantity,
      status: form.status,
    };

    setEquipment((current) => {
      if (editingEquipment) {
        return current.map((equipmentItem) => equipmentItem.id === item.id ? item : equipmentItem);
      }
      return [...current, item];
    });

    setFormOpen(false);
    setNotice(editingEquipment ? "Equipamento atualizado." : "Equipamento cadastrado.");
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>PATRIMÔNIO</span>
          <h1>Equipamentos</h1>
          <p>Itens, quantidades e situação dos equipamentos.</p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> Novo equipamento
        </button>
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

      <p className={styles.recordCount}>{equipment.length} {equipment.length === 1 ? "equipamento cadastrado" : "equipamentos cadastrados"}</p>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Equipamentos cadastrados</caption>
          <thead>
            <tr><th scope="col">Equipamento</th><th scope="col">Categoria</th><th scope="col">Quantidade</th><th scope="col">Situação</th><th scope="col">Ações</th></tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.id}>
                <td><strong className={styles.name}>{item.name}</strong><span className={styles.muted}>{item.id}</span></td>
                <td>{item.category}</td>
                <td>{item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}</td>
                <td><span className={`${styles.status} ${statusStyles[item.status]}`}>{item.status}</span></td>
                <td>
                  <button type="button" className={styles.iconButton} onClick={() => openEdit(item)} aria-label={`Editar ${item.name}`} title="Editar equipamento">
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
            {equipment.length === 0 && <tr><td colSpan={5} className={styles.empty}>Nenhum equipamento cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <FormDialog title={editingEquipment ? "Editar equipamento" : "Novo equipamento"} onClose={() => setFormOpen(false)}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              Nome do equipamento
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={120} />
            </label>
            <label className={styles.field}>
              Categoria
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required maxLength={60} placeholder="Ex.: Sonorização" />
            </label>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                Quantidade
                <input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required min="0" step="1" />
              </label>
              <label className={styles.field}>
                Situação
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EquipmentStatus })}>
                  {equipmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setFormOpen(false)}>Cancelar</button>
              <button type="submit" className={styles.primaryButton}><Save size={16} aria-hidden="true" /> Salvar equipamento</button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
