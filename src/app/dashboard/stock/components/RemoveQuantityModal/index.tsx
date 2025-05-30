import React, { useState } from "react";
import ReactModal from "react-modal";
import styles from "../../styles.module.scss";
import { toast } from "sonner";
import { api } from "@/services/api";
import { StockItem } from "../StockList";
import { getCookieClient } from "@/lib/cookieClient";
interface RemoveProps {
  item: StockItem;
  onClose(): void;
  onSuccess(): Promise<void>;
  onOptimistic?(id: string, delta: number): void;
}

export default function RemoveQuantityModal({ item, onClose, onSuccess,onOptimistic }: RemoveProps) {
  const [quantity, setQuantity] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const token = getCookieClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(quantity);
    if (q <= 0) return toast.error("Informe uma quantidade maior que zero");

    
    setSaving(true);
    onOptimistic?.(item.id, q);
    try {
      await api.post("/stock/bulk-remove", { items: [{ id: item.id, quantity: q }] }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },});
      toast.success("Quantidade removida com sucesso");
      onClose();
      await onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao remover quantidade");
    } finally {
      setSaving(false);
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
      <h2>Remover de {item.name}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Quantidade
          <input
            type="number"
            min="0"
            step="0.01"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
        </label>
        <footer className={styles.formFooter}>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </footer>
      </form>
    </ReactModal>
  );
}