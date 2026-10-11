import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import styles from "../../styles/Management.module.css";

type FormDialogProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function FormDialog({ title, onClose, children }: FormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement | HTMLSelectElement>("input, select")?.focus();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.dialogHeader}>
        <h2 id={titleId}>{title}</h2>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Fechar" title="Fechar">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
