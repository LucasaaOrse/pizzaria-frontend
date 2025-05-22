import React, { useState } from "react";
import ReactModal from "react-modal";
import styles from "../../styles.module.scss";
import { toast } from "sonner";
import { api } from "@/services/api";
import { StockItem } from "../StockList";
import { getCookieClient } from "@/lib/cookieClient";

interface DeleteProps {
  item: StockItem;
  onClose(): void;
  onSuccess(): Promise<void>;
  onOptimistic?(id: string): void;
}

export default function ConfirmDeleteModal({ item, onClose, onSuccess, onOptimistic}: DeleteProps) {
  const [deleting, setDeleting] = useState<boolean>(false);

  const token = getCookieClient()

  async function handleDelete() {
    onOptimistic?.(item.id);
    setDeleting(true);
    try {
      await api.delete(`/stock/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }});
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
        <button type="button" onClick={onClose} disabled={deleting} className="cancelButton" >Cancelar</button>
        <button type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Removendo…" : "Confirmar"}
        </button>
      </footer>
    </ReactModal>
  );
}
