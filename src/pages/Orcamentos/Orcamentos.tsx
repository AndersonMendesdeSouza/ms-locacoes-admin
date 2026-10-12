import { useEffect, useState, type FormEvent } from "react";
import { createPortal, flushSync } from "react-dom";
import { Link, useOutletContext } from "react-router";
import { Check, CheckCircle2, Eye, FileText, Plus, Printer, Trash2, X } from "lucide-react";
import FormDialog from "../../components/FormDialog/FormDialog";
import type { ManagementContext, Quote, QuoteItem } from "../../types/management";
import shared from "../../styles/Management.module.css";
import styles from "./Orcamentos.module.css";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function quoteTotal(items: QuoteItem[]) {
  // Soma em centavos para evitar diferenças de arredondamento entre os itens.
  return items.reduce((total, item) => total + Math.round(item.unitPrice * 100) * item.quantity, 0) / 100;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}

function QuoteDetails({ quote }: { quote: Quote }) {
  return (
    <div className={styles.quoteDetails}>
      <dl className={styles.details}>
        <div>
          <dt>Cliente</dt><dd>{quote.clientName}</dd>
        </div>
        <div>
          <dt>Data do evento</dt><dd>{formatDate(quote.date)}</dd>
        </div>
        <div>
          <dt>Local</dt><dd>{quote.location}</dd>
        </div>
        <div>
          <dt>Emissão</dt><dd>{new Date(quote.createdAt).toLocaleDateString("pt-BR")}</dd>
        </div>
      </dl>
      <div className={shared.tableWrapper}>
        <table className={`${shared.table} ${styles.itemTable}`}>
          <caption className={shared.srOnly}>Itens do orçamento {quote.id}</caption>
          <thead>
            <tr>
              <th scope="col">Produto</th><th scope="col">Qtd.</th>
              <th scope="col">Unitário</th><th scope="col">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.equipmentId}>
                <td>{item.name}</td><td>{item.quantity}</td>
                <td>{currency.format(item.unitPrice)}</td>
                <td>{currency.format(quoteTotal([item]))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.total}>
        <span>Total do orçamento</span>
        <strong>{currency.format(quoteTotal(quote.items))}</strong>
      </div>
    </div>
  );
}

export default function Orcamentos() {
  const { clients, equipment, quotes, setQuotes } = useOutletContext<ManagementContext>();
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [confirmingQuote, setConfirmingQuote] = useState<Quote | null>(null);
  const [printQuote, setPrintQuote] = useState<Quote | null>(null);
  const selectedEquipment = equipment.find((item) => item.id === equipmentId);

  useEffect(() => {
    function clearPrintQuote() {
      setPrintQuote(null);
    }
    window.addEventListener("afterprint", clearPrintQuote);
    return () => window.removeEventListener("afterprint", clearPrintQuote);
  }, []);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const count = Number(quantity);
    const price = Number(unitPrice);

    if (!selectedEquipment || selectedEquipment.status !== "Disponível" || selectedEquipment.quantity === 0) {
      setError("Selecione um produto disponível.");
      return;
    }
    if (!Number.isSafeInteger(count) || count < 1) {
      setError("Informe uma quantidade inteira maior que zero.");
      return;
    }
    if (!unitPrice.trim() || !Number.isFinite(price) || price < 0 || price > 999999.99) {
      setError("Informe um valor unitário entre R$ 0,00 e R$ 999.999,99.");
      return;
    }
    const existingItem = items.find((item) => item.equipmentId === equipmentId);
    const totalQuantity = (existingItem?.quantity ?? 0) + count;
    if (totalQuantity > selectedEquipment.quantity) {
      setError(`Este produto possui ${selectedEquipment.quantity} unidades disponíveis no cadastro.`);
      return;
    }
    const roundedPrice = Math.round(price * 100) / 100;
    if (existingItem && existingItem.unitPrice !== roundedPrice) {
      setError("Este produto já foi adicionado com outro valor. Ajuste o valor na lista de itens.");
      return;
    }
    const item: QuoteItem = {
      equipmentId,
      name: selectedEquipment.name,
      quantity: totalQuantity,
      unitPrice: roundedPrice,
    };
    setItems((current) => {
      if (existingItem) {
        return current.map((entry) => entry.equipmentId === equipmentId ? item : entry);
      }
      return [...current, item];
    });
    setEquipmentId("");
    setQuantity("1");
    setUnitPrice("");
    setError("");
    setNotice(`${selectedEquipment.name} adicionado ao orçamento.`);
  }

  function updateItem(id: string, field: "quantity" | "unitPrice", value: string) {
    const number = Number(value);
    const product = equipment.find((item) => item.id === id);
    if (!value.trim() || !Number.isFinite(number) || number < 0) {
      setError("Informe um valor válido para o item.");
      return false;
    }
    if (field === "quantity" && (!Number.isSafeInteger(number) || number < 1 || number > (product?.quantity ?? 0))) {
      setError(`A quantidade deve estar entre 1 e ${product?.quantity ?? 0}.`);
      return false;
    }
    if (field === "unitPrice" && number > 999999.99) {
      setError("O valor unitário máximo é R$ 999.999,99.");
      return false;
    }
    const updatedValue = field === "unitPrice" ? Math.round(number * 100) / 100 : number;
    setItems((current) => current.map((item) => {
      if (item.equipmentId !== id) return item;
      return { ...item, [field]: updatedValue };
    }));
    setError("");
    return true;
  }

  function createDraft(): Quote | null {
    const client = clients.find((item) => item.id === clientId);
    if (!client || !date || Number.isNaN(new Date(`${date}T12:00:00`).getTime()) || !location.trim()) {
      setError("Selecione o cliente e informe a data e o local do evento.");
      return null;
    }
    if (items.length === 0) {
      setError("Adicione pelo menos um produto ao orçamento.");
      return null;
    }
    for (const item of items) {
      const product = equipment.find((entry) => entry.id === item.equipmentId);
      if (!product || product.status !== "Disponível" || item.quantity > product.quantity) {
        setError(`Confira a disponibilidade de ${item.name} antes de finalizar.`);
        return null;
      }
    }
    setError("");
    return {
      id: `ORC-${String(quotes.length + 1).padStart(3, "0")}`,
      clientName: client.name,
      date,
      location: location.trim(),
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({ ...item })),
      status: "Aguardando confirmação",
    };
  }

  function finalizeQuote() {
    const quote = createDraft();
    if (!quote) return;
    setQuotes((current) => [quote, ...current]);
    setItems([]);
    setClientId("");
    setDate("");
    setLocation("");
    setEquipmentId("");
    setQuantity("1");
    setUnitPrice("");
    setNotice(`Orçamento ${quote.id} finalizado e disponível na lista abaixo.`);
  }

  function print(quote: Quote) {
    // A folha precisa estar no DOM antes de abrir a impressão do navegador.
    flushSync(() => setPrintQuote(quote));
    window.print();
  }

  function printDraft() {
    const quote = createDraft();
    if (quote) print({ ...quote, id: "Rascunho" });
  }

  function confirmQuote() {
    if (!confirmingQuote) return;
    setQuotes((current) => current.map((quote) => {
      if (quote.id !== confirmingQuote.id) return quote;
      return { ...quote, status: "Confirmado (simulação)" };
    }));
    setNotice(`Confirmação de ${confirmingQuote.id} simulada. Nenhuma locação foi criada.`);
    setConfirmingQuote(null);
  }

  return (
    <div className={`${shared.page} ${styles.page}`}>
      <header className={shared.pageHeader}>
        <div>
          <span className={shared.eyebrow}>COMERCIAL</span>
          <h1>Orçamentos</h1>
        </div>
      </header>

      {notice && (
        <div className={shared.notice} role="status">
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>{notice}</span>
          <button type="button" className={shared.iconButton} onClick={() => setNotice("")} aria-label="Fechar aviso" title="Fechar aviso">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <section aria-labelledby="new-quote-title" className={styles.builder}>
        <div className={styles.sectionHeading}>
          <h2 id="new-quote-title">Novo orçamento</h2>
          <FileText size={20} aria-hidden="true" />
        </div>
        <div className={styles.eventFields}>
          <label className={shared.field}>
            Cliente
            <select value={clientId} onChange={(event) => setClientId(event.target.value)}>
              <option value="">Selecione o cliente</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </label>
          <label className={shared.field}>
            Data do evento
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className={shared.field}>
            Local do evento
            <input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={160} placeholder="Nome do local ou endereço" />
          </label>
        </div>
        {clients.length === 0 && (
          <p className={shared.error}>Nenhum cliente cadastrado. <Link to="/clientes">Cadastrar cliente</Link></p>
        )}

        <form className={styles.addItem} onSubmit={addItem}>
          <label className={shared.field}>
            Produto
            <select
              value={equipmentId}
              onChange={(event) => {
                setEquipmentId(event.target.value);
                setQuantity("1");
                setUnitPrice("");
              }}
              required
            >
              <option value="">Selecione um produto cadastrado</option>
              {equipment.map((item) => (
                <option key={item.id} value={item.id} disabled={item.status !== "Disponível" || item.quantity === 0}>
                  {item.name} - {item.status === "Disponível" ? `${item.quantity} un.` : item.status}
                </option>
              ))}
            </select>
          </label>
          <label className={shared.field}>
            Quantidade
            <input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} min="1" max={selectedEquipment?.quantity} step="1" required inputMode="numeric" />
          </label>
          <label className={shared.field}>
            Valor unitário (R$)
            <input type="number" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} min="0" max="999999.99" step="0.01" placeholder="0,00" required inputMode="decimal" />
          </label>
          <button type="submit" className={shared.primaryButton} disabled={!selectedEquipment}>
            <Plus size={16} aria-hidden="true" />Adicionar
          </button>
        </form>
        {equipment.length === 0 && (
          <p className={shared.error}>Nenhum produto cadastrado. <Link to="/equipamentos">Cadastrar equipamento</Link></p>
        )}
        {error && <p className={shared.error} role="alert">{error}</p>}

        <div className={styles.itemsHeading}>
          <h3>Itens do orçamento</h3>
          <span>{items.length} {items.length === 1 ? "produto" : "produtos"}</span>
        </div>
        <div className={shared.tableWrapper}>
          <table className={`${shared.table} ${styles.itemTable}`}>
            <caption className={shared.srOnly}>Produtos selecionados para o orçamento</caption>
            <thead>
              <tr>
                <th scope="col">Produto</th><th scope="col">Quantidade</th>
                <th scope="col">Unitário (R$)</th><th scope="col">Subtotal</th>
                <th scope="col"><span className={shared.srOnly}>Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.equipmentId}>
                  <td><strong>{item.name}</strong><span className={shared.muted}>{item.equipmentId}</span></td>
                  <td>
                    <input
                      key={`quantity-${item.quantity}`}
                      className={styles.itemInput}
                      aria-label={`Quantidade de ${item.name}`}
                      type="number"
                      defaultValue={item.quantity}
                      min="1"
                      max={equipment.find((product) => product.id === item.equipmentId)?.quantity}
                      step="1"
                      onBlur={(event) => {
                        if (!updateItem(item.equipmentId, "quantity", event.target.value)) {
                          event.target.value = String(item.quantity);
                        }
                      }}
                    />
                  </td>
                  <td>
                    <input
                      key={`price-${item.unitPrice}`}
                      className={styles.itemInput}
                      aria-label={`Valor unitário de ${item.name}`}
                      type="number"
                      defaultValue={item.unitPrice.toFixed(2)}
                      min="0"
                      max="999999.99"
                      step="0.01"
                      onBlur={(event) => {
                        if (!updateItem(item.equipmentId, "unitPrice", event.target.value)) {
                          event.target.value = item.unitPrice.toFixed(2);
                        }
                      }}
                    />
                  </td>
                  <td className={shared.nowrap}>{currency.format(quoteTotal([item]))}</td>
                  <td>
                    <button
                      type="button"
                      className={shared.iconButton}
                      onClick={() => {
                        setItems((current) => current.filter((entry) => entry.equipmentId !== item.equipmentId));
                        setError("");
                      }}
                      aria-label={`Remover ${item.name}`}
                      title="Remover produto"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className={shared.empty}>Nenhum produto adicionado.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className={styles.builderFooter}>
          <div className={styles.total}>
            <span>Total do orçamento</span>
            <strong>{currency.format(quoteTotal(items))}</strong>
          </div>
          <div className={styles.actions}>
            <button type="button" className={shared.secondaryButton} onClick={printDraft} disabled={items.length === 0}>
              <Printer size={16} aria-hidden="true" />Imprimir orçamento
            </button>
            <button type="button" className={shared.primaryButton} onClick={finalizeQuote} disabled={items.length === 0}>
              <Check size={16} aria-hidden="true" />Finalizar orçamento
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="saved-quotes-title" className={styles.saved}>
        <div className={styles.sectionHeading}>
          <h2 id="saved-quotes-title">Orçamentos finalizados</h2>
          <span>{quotes.length}</span>
        </div>
        <p className={styles.sessionNote}>Registros temporários desta sessão. Serão perdidos ao atualizar a página.</p>
        <div className={shared.tableWrapper}>
          <table className={shared.table}>
            <caption className={shared.srOnly}>Orçamentos finalizados nesta sessão</caption>
            <thead>
              <tr>
                <th scope="col">Orçamento / Cliente</th><th scope="col">Evento</th>
                <th scope="col">Total</th><th scope="col">Situação</th><th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <td>
                    <span className={shared.code}>{quote.id}</span>
                    <strong className={shared.name}>{quote.clientName}</strong>
                  </td>
                  <td>{formatDate(quote.date)}<span className={shared.muted}>{quote.location}</span></td>
                  <td className={shared.nowrap}>{currency.format(quoteTotal(quote.items))}</td>
                  <td>
                    <span className={`${shared.status} ${quote.status === "Aguardando confirmação" ? shared.warning : shared.success}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={shared.iconButton} onClick={() => setViewingQuote(quote)} aria-label={`Ver orçamento ${quote.id}`} title="Ver orçamento">
                        <Eye size={16} aria-hidden="true" />
                      </button>
                      <button type="button" className={shared.iconButton} onClick={() => print(quote)} aria-label={`Imprimir orçamento ${quote.id}`} title="Imprimir orçamento">
                        <Printer size={16} aria-hidden="true" />
                      </button>
                      {quote.status === "Aguardando confirmação" && (
                        <button type="button" className={shared.secondaryButton} onClick={() => setConfirmingQuote(quote)}>
                          <Check size={15} aria-hidden="true" />Confirmar locação
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && <tr><td colSpan={5} className={shared.empty}>Nenhum orçamento finalizado.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {viewingQuote && (
        <FormDialog title={`Orçamento ${viewingQuote.id}`} onClose={() => setViewingQuote(null)}>
          <QuoteDetails quote={viewingQuote} />
          <div className={shared.formActions}>
            <button type="button" className={shared.secondaryButton} onClick={() => setViewingQuote(null)}>Fechar</button>
            <button type="button" className={shared.primaryButton} onClick={() => print(viewingQuote)}>
              <Printer size={16} aria-hidden="true" />Imprimir
            </button>
          </div>
        </FormDialog>
      )}
      {confirmingQuote && (
        <FormDialog title="Confirmar locação" onClose={() => setConfirmingQuote(null)}>
          <p className={styles.confirmText}>
            Confirmar o orçamento <strong>{confirmingQuote.id}</strong> de <strong>{confirmingQuote.clientName}</strong>?
          </p>
          <p className={styles.sessionNote}>
            Esta confirmação é uma simulação. Ainda não cria uma locação nem reserva os produtos.
          </p>
          <div className={shared.formActions}>
            <button type="button" className={shared.secondaryButton} onClick={() => setConfirmingQuote(null)}>Cancelar</button>
            <button type="button" className={shared.primaryButton} onClick={confirmQuote}>
              <Check size={16} aria-hidden="true" />Confirmar
            </button>
          </div>
        </FormDialog>
      )}
      {printQuote && createPortal(
        <article className={styles.printSheet}>
          <header className={styles.printHeader}>
            <strong>MS LOCAÇÕES</strong>
            <div><h1>Orçamento</h1><span>{printQuote.id}</span></div>
          </header>
          <QuoteDetails quote={printQuote} />
          <p className={styles.printNote}>
            Orçamento sujeito à confirmação de disponibilidade. Não representa reserva de produtos.
          </p>
        </article>,
        document.body,
      )}
    </div>
  );
}
