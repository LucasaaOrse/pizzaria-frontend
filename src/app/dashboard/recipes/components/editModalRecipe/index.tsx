// components/EditRecipeModal.tsx (atualizado)
"use client";

import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import styles from "../../page.module.scss";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";

interface StockItem {
  id: number;
  name: string;
  unit: string;
}

interface IngredientForm {
  stockItemId: number;
  quantity: number;
}

interface EditRecipeModalProps {
  isOpen: boolean;
  product: { id: number; name: string };
  stockItems: StockItem[];
  onClose: () => void;
}

export default function EditRecipeModal({ isOpen, product, stockItems, onClose }: EditRecipeModalProps) {
  const [formItems, setFormItems] = useState<IngredientForm[]>([]);
  const [saving, setSaving] = useState(false);

  // Sempre inicializa formItems com base em stockItems quando o modal abre
  useEffect(() => {
    if (isOpen && stockItems.length) {
      setFormItems(
        stockItems.map(item => ({ stockItemId: item.id, quantity: 0 }))
      );
    }
  }, [isOpen, stockItems]);

  function handleChange(id: number, value: string) {
    setFormItems(prev =>
      prev.map(f =>
        f.stockItemId === id ? { ...f, quantity: Number(value) } : f
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const token = await getCookieClient();
      const payload = formItems
        .filter(f => f.quantity > 0)
        .map(f => ({ stock_item_id: f.stockItemId, quantity: f.quantity }));

      await api.post(
        `/product/${product.id}/recipe`,
        { ingredients: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Receita atualizada com sucesso");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar receita");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <h2>Editar Receita: {product.name}</h2>
      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        {formItems.map(f => {
          const stockInfo = stockItems.find(item => item.id === f.stockItemId);
          return (
            <label key={f.stockItemId} className={styles.modalField}>
              {stockInfo ? `${stockInfo.name} (${stockInfo.unit})` : ""}
              <input
                type="number"
                min="0"
                step="any"
                value={f.quantity}
                onChange={e => handleChange(f.stockItemId, e.target.value)}
              />
            </label>
          );
        })}
        <footer className={styles.formFooter}>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando…" : "Salvar Receita"}
          </button>
        </footer>
      </form>
    </ReactModal>
  );
}