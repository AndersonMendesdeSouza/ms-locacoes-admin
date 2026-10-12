import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  Armchair,
  Barcode,
  Check,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ScanLine,
  Table2,
  Tent,
  Truck,
} from "lucide-react";
import { Link } from "react-router";
import styles from "./EmployeeHome.module.css";

type ProductType = "Cadeira" | "Mesa" | "Tenda";
type OperationMode = "Entrega" | "Recolhimento";

type ProductRecord = {
  id: string;
  operation: OperationMode;
  productType: ProductType;
  rentalId: string;
  location: string;
  quantity: number;
  registeredAt: string;
};

type Feedback = {
  message: string;
  isError: boolean;
};

type RentalOption = {
  id: string;
  client: string;
  location: string;
  products: { productType: ProductType; requestedQuantity: number }[];
};

const rentalOptions: RentalOption[] = [
  {
    id: "LOC-001", client: "João Carlos", location: "Salão Central",
    products: [{ productType: "Cadeira", requestedQuantity: 10 }],
  },
  {
    id: "LOC-002", client: "Prefeitura Municipal", location: "Praça Municipal",
    products: [
      { productType: "Cadeira", requestedQuantity: 20 },
      { productType: "Mesa", requestedQuantity: 10 },
    ],
  },
  {
    id: "LOC-003", client: "Mariana Oliveira", location: "Espaço Primavera",
    products: [
      { productType: "Cadeira", requestedQuantity: 30 },
      { productType: "Mesa", requestedQuantity: 15 },
      { productType: "Tenda", requestedQuantity: 2 },
    ],
  },
];

const productIcons = {
  Cadeira: Armchair,
  Mesa: Table2,
  Tenda: Tent,
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function EmployeeHome() {
  const [productType, setProductType] = useState<ProductType>("Cadeira");
  const [selectedRentalId, setSelectedRentalId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [records, setRecords] = useState<ProductRecord[]>([]);
  const [readerFocused, setReaderFocused] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [mode, setMode] = useState<OperationMode>("Entrega");
  const barcodeRef = useRef<HTMLInputElement>(null);
  const rentalRef = useRef<HTMLSelectElement>(null);
  const productLabel = productType.toLowerCase();
  const quantityFontSize = Math.min(40, 160 / String(quantity).length);

  function getProductsForRental(rental: RentalOption, operation: OperationMode) {
    const products = rental.products.map((product) => product.productType);
    if (operation === "Entrega") return products;
    return products.filter((product) => records.some((record) =>
      record.operation === "Entrega" && record.rentalId === rental.id && record.productType === product,
    ));
  }

  function getRequestedQuantity(rental: RentalOption, product: ProductType) {
    return rental.products.find((item) => item.productType === product)?.requestedQuantity ?? 0;
  }

  function getProductTotals(rentalId: string, product: ProductType) {
    let delivered = 0;
    let collected = 0;
    for (const record of records) {
      if (record.rentalId !== rentalId || record.productType !== product) continue;
      if (record.operation === "Entrega") {
        delivered += record.quantity;
      } else {
        collected += record.quantity;
      }
    }
    return { delivered, collected, remaining: delivered - collected };
  }

  function getSelectableProducts(rental: RentalOption, operation: OperationMode) {
    const products = getProductsForRental(rental, operation);
    if (operation === "Entrega") {
      return products.filter((product) =>
        getProductTotals(rental.id, product).delivered < getRequestedQuantity(rental, product),
      );
    }
    return products.filter((product) => getProductTotals(rental.id, product).remaining > 0);
  }

  const availableRentals = rentalOptions.filter((rental) => getProductsForRental(rental, mode).length > 0);
  const selectedRental = availableRentals.find((rental) => rental.id === selectedRentalId);
  const availableProducts = selectedRental ? getProductsForRental(selectedRental, mode) : [];
  const selectableProducts = selectedRental ? getSelectableProducts(selectedRental, mode) : [];
  const hasSelectedProduct = selectableProducts.includes(productType);
  const rentalProducts = availableProducts.map((product) => ({
    productType: product,
    ...getProductTotals(selectedRentalId, product),
  }));
  const completedProducts = rentalProducts.filter((product) => product.remaining === 0).length;
  const totals = getProductTotals(selectedRentalId, productType);
  const requestedQuantity = selectedRental ? getRequestedQuantity(selectedRental, productType) : 0;
  const maxQuantity = mode === "Recolhimento" ? totals.remaining : requestedQuantity - totals.delivered;
  const canCount = !!selectedRental && hasSelectedProduct && maxQuantity > 0;
  const canRegister = canCount && Number.isSafeInteger(quantity) && quantity > 0 &&
    quantity <= maxQuantity && (mode === "Recolhimento" || quantity === maxQuantity);
  const rentalComplete = availableProducts.length > 0 && selectableProducts.length === 0;
  const ProductIcon = hasSelectedProduct ? productIcons[productType] : Barcode;
  let conferenceMessage = "Recolhimento pendente";
  if (totals.remaining === 0) conferenceMessage = "Produto conferido; outros produtos pendentes";
  if (rentalComplete) {
    conferenceMessage = mode === "Entrega" ? "Entrega concluída neste local" : "Tudo conferido neste local";
  }
  let productPlaceholder = "Selecione o local primeiro";
  if (selectedRental) productPlaceholder = "Selecione um produto";
  if (rentalComplete) {
    productPlaceholder = mode === "Entrega" ? "Todos os produtos entregues" : "Todos os produtos conferidos";
  }

  useEffect(() => {
    if (records.length === 0) return;
    if (barcodeRef.current && !barcodeRef.current.disabled) {
      barcodeRef.current.focus();
      return;
    }
    rentalRef.current?.focus();
  }, [records, mode]);

  function changeMode(nextMode: OperationMode) {
    if (quantity > 0 || nextMode === mode) return;
    if (selectedRental) {
      const deliveredProducts = getProductsForRental(selectedRental, nextMode);
      const nextProducts = getSelectableProducts(selectedRental, nextMode);
      if (deliveredProducts.length === 0) {
        setSelectedRentalId("");
      } else if (nextProducts.length > 0 && !nextProducts.includes(productType)) {
        setProductType(nextProducts[0]);
      }
    }
    setMode(nextMode);
    if (barcodeRef.current) barcodeRef.current.value = "";
    setFeedback(null);
  }

  function countScan() {
    const barcodeInput = barcodeRef.current;
    if (!barcodeInput || !barcodeInput.value.trim()) return;
    barcodeInput.value = "";
    if (!selectedRental) {
      setFeedback({ message: "Selecione uma locação antes de iniciar a contagem.", isError: true });
      rentalRef.current?.focus();
      return;
    }

    if (!canCount || quantity >= maxQuantity) {
      setFeedback({
        message: mode === "Recolhimento" ? "A contagem não pode ultrapassar o saldo a recolher." : "A contagem não pode ultrapassar a quantidade solicitada.",
        isError: true,
      });
      barcodeInput.focus();
      return;
    }

    // O código se repete: cada leitura concluída representa mais uma unidade.
    setQuantity((currentQuantity) => Math.min(maxQuantity, currentQuantity + 1));
    barcodeInput.focus();
    setFeedback(null);
  }

  function handleBarcodeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    if (!event.repeat && !event.nativeEvent.isComposing) countScan();
  }

  function adjustQuantity(amount: number) {
    if (!canCount) return;
    setQuantity((currentQuantity) =>
      Math.min(maxQuantity, Math.max(0, currentQuantity + amount)),
    );
    setFeedback(null);
    barcodeRef.current?.focus();
  }

  function registerRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRental || !hasSelectedProduct || !Number.isSafeInteger(quantity) || quantity <= 0) {
      setFeedback({
        message: "Selecione uma locação e informe uma quantidade maior que zero.",
        isError: true,
      });
      return;
    }

    if (quantity > maxQuantity) {
      setFeedback({ message: "A quantidade ultrapassa o limite disponível para esta operação.", isError: true });
      return;
    }

    if (mode === "Entrega" && quantity !== maxQuantity) {
      setFeedback({
        message: `A entrega exige ${requestedQuantity} unidades. Faltam ${maxQuantity - quantity} para concluir a contagem.`,
        isError: true,
      });
      return;
    }

    if (barcodeRef.current?.value.trim()) {
      setFeedback({
        message: "Conclua a leitura em andamento antes de registrar.",
        isError: true,
      });
      barcodeRef.current.focus();
      return;
    }

    const record: ProductRecord = {
      id: crypto.randomUUID(),
      operation: mode,
      productType,
      rentalId: selectedRental.id,
      location: selectedRental.location,
      quantity,
      registeredAt: new Date().toISOString(),
    };

    setRecords((currentRecords) => [record, ...currentRecords]);
    setFeedback({
      message: `${mode === "Entrega" ? "Entrega registrada" : "Recolhimento registrado"}: ${quantity} ${productLabel}${quantity === 1 ? "" : "s"} em ${selectedRental.location}.`,
      isError: false,
    });
    setQuantity(0);
    if (quantity === maxQuantity) {
      const nextProduct = selectableProducts.find((product) => product !== productType);
      if (nextProduct) setProductType(nextProduct);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/employee" className={styles.brand} aria-label="MS Locações, início">
            <span className={styles.brandMark}>MS</span>
            <span>LOCAÇÕES</span>
          </Link>
          <div className={styles.account}>
            <span className={styles.accountLabel}>Área do funcionário</span>
            <Link to="/" className={styles.exitLink}>
              <LogOut size={17} aria-hidden="true" />
              Sair
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.pageHeading}>
          <div>
            <span className={styles.eyebrow}>PRODUTOS</span>
            <h1>{mode === "Entrega" ? "Registrar entrega" : "Registrar recolhimento"}</h1>
            <p>{mode === "Entrega" ? "Produtos deixados no local" : "Conferência dos produtos que retornaram"}</p>
          </div>
          <fieldset className={styles.modeSwitch} disabled={quantity > 0}>
            <legend className={styles.visuallyHidden}>Tipo de movimentação</legend>
            <span className={`${styles.modeThumb} ${mode === "Recolhimento" ? styles.collectionThumb : ""}`} aria-hidden="true" />
            <label className={`${styles.modeOption} ${mode === "Entrega" ? styles.modeSelected : ""}`}>
              <input
                className={styles.visuallyHidden}
                type="radio"
                name="operation-mode"
                value="Entrega"
                checked={mode === "Entrega"}
                onChange={() => changeMode("Entrega")}
              />
              <Truck size={17} aria-hidden="true" />
              Entrega
            </label>
            <label className={`${styles.modeOption} ${mode === "Recolhimento" ? styles.modeSelected : ""}`}>
              <input
                className={styles.visuallyHidden}
                type="radio"
                name="operation-mode"
                value="Recolhimento"
                checked={mode === "Recolhimento"}
                onChange={() => changeMode("Recolhimento")}
              />
              <RotateCcw size={17} aria-hidden="true" />
              Recolhimento
            </label>
          </fieldset>
        </div>

        {mode === "Recolhimento" && availableRentals.length === 0 && (
          <p className={styles.emptyState} role="status">Nenhuma entrega registrada para recolhimento nesta sessão.</p>
        )}

        <form onSubmit={registerRecord} className={styles.form}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="product-rental">Local (locação)</label>
              <div className={styles.inputWrapper}>
                <MapPin size={19} aria-hidden="true" />
                <select
                  ref={rentalRef}
                  id="product-rental"
                  value={selectedRentalId}
                  disabled={quantity > 0 || availableRentals.length === 0}
                  aria-describedby={selectedRental ? "rental-location" : undefined}
                  onChange={(event) => {
                    if (quantity > 0) return;
                    const nextRental = availableRentals.find((rental) => rental.id === event.target.value);
                    setSelectedRentalId(nextRental?.id ?? "");
                    if (nextRental) {
                      const nextProducts = getSelectableProducts(nextRental, mode);
                      if (!nextProducts.includes(productType)) setProductType(nextProducts[0] ?? "Cadeira");
                    }
                    if (barcodeRef.current) barcodeRef.current.value = "";
                    setFeedback(null);
                  }}
                  required
                >
                  <option value="">Selecione um local</option>
                  {availableRentals.map((rental) => (
                    <option key={rental.id} value={rental.id}>
                      {rental.id} - {rental.client}
                    </option>
                  ))}
                </select>
              </div>
              {selectedRental && (
                <p id="rental-location" className={styles.locationName}>{selectedRental.location}</p>
              )}
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="product-type">Produto para dar baixa</label>
                {quantity > 0 && (
                  <span className={styles.readerStatus} id="product-count-status">
                    Contagem em andamento
                  </span>
                )}
              </div>
              <div className={styles.inputWrapper}>
                <ProductIcon size={19} aria-hidden="true" />
                <select
                  id="product-type"
                  value={hasSelectedProduct ? productType : ""}
                  disabled={!selectedRental || selectableProducts.length === 0 || quantity > 0}
                  aria-describedby={quantity > 0 ? "product-count-status" : undefined}
                  onChange={(event) => {
                    if (!selectedRental || quantity > 0) return;
                    const nextProductType = event.target.value;
                    if (nextProductType !== "Cadeira" && nextProductType !== "Mesa" && nextProductType !== "Tenda") return;
                    if (!selectableProducts.includes(nextProductType)) return;
                    setProductType(nextProductType);
                    if (barcodeRef.current) barcodeRef.current.value = "";
                    setFeedback(null);
                  }}
                  required
                >
                  {!hasSelectedProduct && <option value="">{productPlaceholder}</option>}
                  {selectableProducts.map((product) => (
                    <option key={product} value={product}>
                      {product}{mode === "Entrega" && selectedRental ? ` - ${getRequestedQuantity(selectedRental, product)} solicitadas` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="product-barcode">Código de barras</label>
                <span className={`${styles.readerStatus} ${readerFocused ? styles.readerActive : ""}`}>
                  <span aria-hidden="true" />
                  {readerFocused ? "Leitor pronto" : "Leitor em pausa"}
                </span>
              </div>
              <div className={styles.inputWrapper}>
                <Barcode size={21} aria-hidden="true" />
                <input
                  ref={barcodeRef}
                  id="product-barcode"
                  placeholder="Código do produto"
                  disabled={!canCount}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onKeyDown={handleBarcodeKeyDown}
                  onFocus={() => setReaderFocused(true)}
                  onBlur={() => setReaderFocused(false)}
                />
                <button
                  type="button"
                  className={styles.iconButton}
                  disabled={!canCount}
                  onClick={() => barcodeRef.current?.focus()}
                  aria-label="Ativar leitor"
                  title="Ativar leitor"
                >
                  <ScanLine size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.registerButton}
              disabled={!canRegister}
            >
              <Check size={18} aria-hidden="true" />
              {mode === "Entrega" ? "Registrar entrega" : "Registrar recolhimento"}
            </button>
          </div>

          <div className={styles.counting}>
            {mode === "Recolhimento" && selectedRental && (
              <section className={styles.productSummary} aria-labelledby="local-products-title">
                <div className={styles.productSummaryHeading}>
                  <h2 id="local-products-title">Produtos no local</h2>
                  <span>{completedProducts} de {rentalProducts.length} OK</span>
                </div>
                <ul className={styles.productSummaryList}>
                  {rentalProducts.map((product) => {
                    const ItemIcon = productIcons[product.productType];
                    const isComplete = product.remaining === 0;
                    return (
                      <li
                        key={product.productType}
                        className={`${styles.productLine} ${isComplete ? styles.productDone : ""} ${!isComplete && product.productType === productType ? styles.productActive : ""}`}
                      >
                        <span className={styles.productSummaryIcon}>
                          <ItemIcon size={19} aria-hidden="true" />
                        </span>
                        <div className={styles.productSummaryInfo}>
                          <strong>{product.productType}s</strong>
                          <span>{product.collected} de {product.delivered} recolhidas</span>
                        </div>
                        <span className={isComplete ? styles.productOk : styles.productMissing}>
                          {isComplete && <CheckCircle2 size={15} aria-hidden="true" />}
                          {isComplete ? "OK" : `Faltam ${product.remaining}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
            {rentalComplete && (
              <p className={styles.localComplete} role="status">
                <CheckCircle2 size={21} aria-hidden="true" />
                {conferenceMessage}
              </p>
            )}
            {mode === "Recolhimento" && selectedRental && hasSelectedProduct && !rentalComplete && (
              <section aria-label="Conferência do produto" className={styles.conference}>
                <dl className={styles.balanceGrid}>
                  <div className={styles.deliveredBalance}>
                    <dt>Entregues</dt>
                    <dd>{totals.delivered}</dd>
                  </div>
                  <div className={styles.collectedBalance}>
                    <dt>Já recolhidos</dt>
                    <dd>{totals.collected}</dd>
                  </div>
                  <div className={styles.remainingBalance}>
                    <dt>Faltam</dt>
                    <dd>{totals.remaining}</dd>
                  </div>
                </dl>
                <p className={rentalComplete || totals.remaining === 0 ? styles.conferenceComplete : styles.conferencePending} role="status">
                  {totals.remaining === 0 ? <CheckCircle2 size={16} aria-hidden="true" /> : <Clock3 size={16} aria-hidden="true" />}
                  {conferenceMessage}
                </p>
              </section>
            )}
            {!rentalComplete && (
              <section className={styles.counterCard} aria-label="Contagem de produtos">
                <div className={styles.counterHeading}>
                  <label htmlFor="product-quantity">
                    {selectedRental ? `${productType}s nesta contagem` : "Quantidade nesta contagem"}
                  </label>
                  <span className={styles.counterIcon}>
                    <ProductIcon size={23} aria-hidden="true" />
                  </span>
                </div>
                {mode === "Entrega" && selectedRental && hasSelectedProduct && (
                  <p id="delivery-target" className={styles.deliveryTarget}>
                    Solicitado: <strong>{requestedQuantity} {productLabel}{requestedQuantity === 1 ? "" : "s"}</strong>
                  </p>
                )}
                <div className={styles.counterBody}>
                  <div className={styles.counterValue}>
                    <input
                      id="product-quantity"
                      type="number"
                      className={styles.quantityInput}
                      style={{ fontSize: quantityFontSize }}
                      min={0}
                      max={maxQuantity}
                      step={1}
                      disabled={!canCount}
                      aria-describedby={mode === "Entrega" && selectedRental ? "delivery-target delivery-progress" : undefined}
                      value={quantity}
                      onChange={(event) => {
                        if (!canCount) return;
                        const nextQuantity = Number(event.target.value);
                        if (Number.isSafeInteger(nextQuantity) && nextQuantity >= 0) {
                          if (nextQuantity > maxQuantity) {
                            setFeedback({ message: "A quantidade ultrapassa o limite disponível para esta operação.", isError: true });
                            return;
                          }
                          setQuantity(nextQuantity);
                          setFeedback(null);
                        }
                      }}
                    />
                    <span className={styles.quantityLabel} aria-live="polite" aria-atomic="true">
                      {quantity}{mode === "Entrega" && selectedRental ? ` de ${maxQuantity}` : ""} {selectedRental ? productLabel : "unidade"}{quantity === 1 ? " contabilizada" : "s contabilizadas"}
                    </span>
                  </div>
                  <div className={styles.counterActions}>
                    <button
                      type="button"
                      onClick={() => adjustQuantity(-1)}
                      disabled={quantity === 0}
                      aria-label={`Remover uma ${productLabel}`}
                      title={`Remover uma ${productLabel}`}
                    >
                      <Minus size={19} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustQuantity(1)}
                      disabled={!canCount || quantity >= maxQuantity}
                      aria-label={`Adicionar uma ${productLabel}`}
                      title={`Adicionar uma ${productLabel}`}
                    >
                      <Plus size={19} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {mode === "Entrega" && selectedRental && hasSelectedProduct && (
                  <div className={styles.deliveryProgress}>
                    <progress value={quantity} max={maxQuantity} aria-label="Progresso da entrega" />
                    <p id="delivery-progress" role="status">
                      {quantity === maxQuantity && <CheckCircle2 size={15} aria-hidden="true" />}
                      {quantity === maxQuantity ? "Quantidade conferida" : `Faltam ${maxQuantity - quantity}`}
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>
        </form>

        <div className={styles.feedbackArea} aria-live="polite" aria-atomic="true">
          {feedback && (
            <p className={feedback.isError ? styles.error : styles.success}>
              {!feedback.isError && <CheckCircle2 size={18} aria-hidden="true" />}
              {feedback.message}
            </p>
          )}
        </div>

        <section className={styles.records} aria-labelledby="records-title">
          <div className={styles.recordsHeading}>
            <h2 id="records-title">Baixas desta sessão</h2>
            <span className={styles.sessionBadge}>Temporárias</span>
          </div>
          <p className={styles.sessionNotice}>Os registros serão perdidos ao atualizar a página.</p>

          {records.length === 0 ? (
            <p className={styles.emptyState}>Nenhuma baixa registrada nesta sessão.</p>
          ) : (
            <ul className={styles.recordList}>
              {records.map((record) => (
                <li key={record.id} className={styles.recordCard}>
                  <span className={styles.recordIcon}>
                    {record.operation === "Entrega" ? <Truck size={19} aria-hidden="true" /> : <RotateCcw size={19} aria-hidden="true" />}
                  </span>
                  <div className={styles.recordInfo}>
                    <strong>{record.location}</strong>
                    <div className={styles.recordMeta}>
                      <span className={styles.recordRental}>{record.rentalId}</span>
                      <span className={record.operation === "Entrega" ? styles.deliveryBadge : styles.collectionBadge}>{record.operation}</span>
                    </div>
                    <time dateTime={record.registeredAt}>
                      {dateFormatter.format(new Date(record.registeredAt))}
                    </time>
                  </div>
                  <span className={styles.recordQuantity}>
                    <strong>{record.quantity}</strong>
                    {record.productType.toLowerCase()}{record.quantity === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
