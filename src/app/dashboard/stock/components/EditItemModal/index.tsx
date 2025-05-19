// components/EditItemModal.tsx
"use client";

import React, { useState } from "react";
import ReactModal from "react-modal";
import styles from "../../styles.module.scss";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import type { StockItem, StockItemType } from "../StockList";

interface EditProps {
  item: StockItem;
  types: StockItemType[];      // cada t.id pode ser string
  onClose(): void;
  onSuccess(): Promise<void>;
  onOptimistic?(updated: StockItem): void;
}

export default function EditItemModal({
  item,
  types,
  onClose,
  onSuccess,
  onOptimistic
}: EditProps) {
  // guardamos typeId, não mais 'type'
  const [form, setForm] = useState({
    name:   item.name,
    unit:   item.unit,
    typeId: String(item.type_id)  // pode vir string ou number
  });
  const [saving, setSaving] = useState(false);
  const token = getCookieClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.unit || !form.typeId) {
      return toast.error("Preencha todos os campos");
    }

    setSaving(true);

    const typeIdNum = Number(form.typeId);
    const payload = {
      name:    form.name,
      unit:    form.unit,
      type_id: typeIdNum,
    };

    // otimização local: converta t.id para number
    const typeName = types.find(t => Number(t.id) === typeIdNum)?.name ?? item.type_name;
    onOptimistic?.({
      ...item,
      name:      form.name,
      unit:      form.unit,
      type_id:   typeIdNum,
      type_name: typeName,
      quantity:  item.quantity,
    });

    try {
      await api.put(
        `/stock/${item.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item atualizado com sucesso");
      onClose();
      await onSuccess();
    } catch (err) {
      toast.error("Erro ao atualizar item");
      await onSuccess();  // revalida em caso de erro
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
      <h2>Editar {item.name}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Nome
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
        <label>
          Tipo
          <select
            name="typeId"                     
            value={form.typeId}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>
                {t.name[0].toUpperCase() + t.name.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Unidade
          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
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
