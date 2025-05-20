// components/EditRecipeModal.tsx (atualizado)
"use client";

import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import styles from "../../page.module.scss";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { Trash2, Plus } from "lucide-react";

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
  onSaveSuccess: () => void;
}

export default function EditRecipeModal({
  isOpen,
  product,
  stockItems,
  onClose,
  onSaveSuccess
}: EditRecipeModalProps) {
  const [available, setAvailable] = useState<StockItem[]>([]);
  const [selected, setSelected] = useState<IngredientForm[]>([]);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAvailable(stockItems);
      setSelected([]);
      setSelectedId(stockItems[0]?.id || 0);
    }
  }, [isOpen, stockItems]);

  const addIngredient = () => {
    if (!selectedId) return;
    if (selected.some(i => i.stockItemId === selectedId)) return;
    setSelected(prev => [...prev, { stockItemId: selectedId, quantity: 0 }]);
  };

  const updateQuantity = (id: number, value: string) => {
    setSelected(prev =>
      prev.map(item =>
        item.stockItemId === id
          ? { ...item, quantity: Number(value) }
          : item
      )
    );
  };

  const removeIngredient = (id: number) => {
    setSelected(prev => prev.filter(item => item.stockItemId !== id));
  };

  async function handleSave() {
    if (selected.length === 0) {
      toast.error("Adicione ao menos 1 ingrediente");
      return;
    }
    setSaving(true);
    try {
      const token = await getCookieClient();
      const payload = selected.map(item => ({
        stock_item_id: item.stockItemId,
        quantity: item.quantity
      }));

      await api.post(
        `/product/${product.id}/recipe`,
        { ingredients: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Receita atualizada com sucesso");
      onSaveSuccess();
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
      <h2>Editar Receita</h2>
      <p className={styles.modalSubtitle}>{product.name}</p>
      <div className={styles.addRow}>
        <select
          value={selectedId}
          onChange={e => setSelectedId(Number(e.target.value))}
          className={styles.select}
        >
          {available.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
        <button onClick={addIngredient} className={styles.addBtn}>
          <Plus />
        </button>
      </div>

      <ul className={styles.selectedList}>
        {selected.map(item => {
          const info = available.find(i => i.id === item.stockItemId)!;
          return (
            <li key={item.stockItemId} className={styles.selectedItem}>
              <span>{info.name}:</span>
              <input
                type="number"
                min="0"
                step="any"
                value={item.quantity}
                onChange={e => updateQuantity(item.stockItemId, e.target.value)}
                className={styles.inputQty}
              />
              <button onClick={() => removeIngredient(item.stockItemId)}>
                <Trash2 />
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.modalActions}>
        <button onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando…" : "Confirmar e Salvar"}
        </button>
      </div>
    </ReactModal>
  );
}
