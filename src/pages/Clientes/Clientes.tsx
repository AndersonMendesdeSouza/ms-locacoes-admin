import { useState, type FormEvent } from "react";
import { useOutletContext } from "react-router";
import { CheckCircle2, Pencil, Plus, Save, X } from "lucide-react";
import FormDialog from "../../components/FormDialog/FormDialog";
import type { Client, ManagementContext } from "../../types/management";
import styles from "../../styles/Management.module.css";

export default function Clientes() {
  const { clients, setClients } = useOutletContext<ManagementContext>();
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function openCreate() {
    setEditingClient(null);
    setForm({ name: "", email: "", phone: "", document: "" });
    setError("");
    setFormOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setForm({ name: client.name, email: client.email, phone: client.phone, document: client.document });
    setError("");
    setFormOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    const client: Client = {
      id: editingClient?.id ?? `CLI-${String(clients.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      document: form.document.trim(),
    };

    setClients((current) => {
      if (editingClient) {
        return current.map((item) => item.id === client.id ? client : item);
      }
      return [...current, client];
    });

    setFormOpen(false);
    setNotice(editingClient ? "Cliente atualizado." : "Cliente cadastrado.");
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>RELACIONAMENTO</span>
          <h1>Clientes</h1>
          <p>Contatos e informações dos seus clientes.</p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> Novo cliente
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

      <p className={styles.recordCount}>{clients.length} {clients.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}</p>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Clientes cadastrados</caption>
          <thead>
            <tr><th scope="col">Cliente</th><th scope="col">E-mail</th><th scope="col">Telefone</th><th scope="col">CPF / CNPJ</th><th scope="col">Ações</th></tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td><strong className={styles.name}>{client.name}</strong><span className={styles.muted}>{client.id}</span></td>
                <td>{client.email || "Não informado"}</td>
                <td className={styles.nowrap}>{client.phone || "Não informado"}</td>
                <td className={styles.nowrap}>{client.document || "Não informado"}</td>
                <td>
                  <button type="button" className={styles.iconButton} onClick={() => openEdit(client)} aria-label={`Editar ${client.name}`} title="Editar cliente">
                    <Pencil size={15} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td colSpan={5} className={styles.empty}>Nenhum cliente cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <FormDialog title={editingClient ? "Editar cliente" : "Novo cliente"} onClose={() => setFormOpen(false)}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              Nome / Razão social
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={120} autoComplete="name" />
            </label>
            <label className={styles.field}>
              E-mail (opcional)
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength={160} autoComplete="email" />
            </label>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                Telefone (opcional)
                <input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} maxLength={25} autoComplete="tel" />
              </label>
              <label className={styles.field}>
                CPF / CNPJ (opcional)
                <input value={form.document} onChange={(event) => setForm({ ...form, document: event.target.value })} maxLength={18} />
              </label>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setFormOpen(false)}>Cancelar</button>
              <button type="submit" className={styles.primaryButton}><Save size={16} aria-hidden="true" /> Salvar cliente</button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  );
}
