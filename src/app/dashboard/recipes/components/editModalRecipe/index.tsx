// components/EditRecipeModal.tsx (modo add/edit unificado)
"use client";

import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import styles from "./EditRecipeModal.module.scss";
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

type Mode = 'add' | 'edit';

interface EditRecipeModalProps {
  isOpen: boolean;
  product: { id: number; name: string };
  stockItems: StockItem[];
  mode: Mode;
  existingIngredients?: IngredientForm[]; // para edit
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function EditRecipeModal({
  isOpen,
  product,
  stockItems,
  mode,
  existingIngredients = [],
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
      setSelected(
        mode === 'edit'
          ? existingIngredients.map(e => ({ ...e }))
          : []
      );
      setSelectedId(stockItems[0]?.id || 0);
    }
  }, [isOpen, stockItems, mode, existingIngredients]);

  const addIngredient = () => {
    if (!selectedId) return;
    if (selected.some(i => i.stockItemId === selectedId)) return;
    setSelected(prev => [...prev, { stockItemId: selectedId, quantity: 1 }]);
  };

  const updateQuantity = (id: number, value: string) => {
    const sanitized = value.replace(/^0+(?=\d)/, "");
    const quantity = sanitized === "" ? 0 : Number(sanitized);
    setSelected(prev =>
      prev.map(item =>
        item.stockItemId === id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeIngredient = (id: number) => {
    setSelected(prev => prev.filter(item => item.stockItemId !== id));
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      return toast.error("Adicione ao menos 1 ingrediente");
    }
    setSaving(true);
    try {
      const token = await getCookieClient();
      const payload = selected.map(item => ({ stock_item_id: item.stockItemId, quantity: item.quantity }));
      if (mode === 'add') {
        await api.post(
          "/product/" + product.id + "/recipe",
          { ingredients: payload },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.put(
          "/product/" + product.id + "/recipe",
          { ingredients: payload },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success(mode === 'add' ? "Receita adicionada com sucesso" : "Receita atualizada com sucesso");
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar receita");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <h2>{mode === 'add' ? 'Adicionar Receita' : 'Editar Receita'}</h2>
        <button onClick={onClose} className={styles.closeBtn}>×</button>
      </div>
      <p className={styles.modalSubtitle}>{product.name}</p>
      <div className={styles.form}>
        <label>
          Ingredientes disponíveis
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
            <button type="button" onClick={addIngredient} className={styles.addBtn}>
              <Plus />
            </button>
          </div>
        </label>

        <ul className={styles.selectedList}>
          {selected.map(item => {
            const info = available.find(i => i.id === item.stockItemId)!;
            return (
              <li key={item.stockItemId} className={styles.selectedItem}>
                <span>{info.name}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.quantity}
                  onChange={e => updateQuantity(item.stockItemId, e.target.value)}
                  className={styles.inputQty}
                />
                <button type="button" onClick={() => removeIngredient(item.stockItemId)} className={styles.removeBtn}>
                  <Trash2 />
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="confirm">
            {saving ? "Salvando…" : mode === 'add' ? "Adicionar Receita" : "Atualizar Receita"}
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
