import React, { useState } from "react";
import ReactModal from "react-modal";
import styles from "../../styles.module.scss";
import { toast } from "sonner";
import { api } from "@/services/api";
import { StockItem } from "../StockList";

interface DeleteProps {
  item: StockItem;
  onClose(): void;
  onSuccess(): Promise<void>;
}

export default function ConfirmDeleteModal({ item, onClose, onSuccess }: DeleteProps) {
  const [deleting, setDeleting] = useState<boolean>(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/stock/${item.id}`);
      toast.success("Item deletado com sucesso");
      onClose();
      await onSuccess();
    } catch (err) {
      toast.error("Erro ao deletar item");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ReactModal
      isOpen
      onRequestClose={onClose}
      ariaHideApp={false}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <h2>Remover {item.name}?</h2>
      <p>Esta ação não poderá ser desfeita.</p>
      <footer className={styles.formFooter}>
        <button type="button" onClick={onClose} disabled={deleting}>Cancelar</button>
        <button type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Removendo…" : "Confirmar"}
        </button>
      </footer>
    </ReactModal>
  );
}
