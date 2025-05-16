import React, { useState } from "react";
import ReactModal from "react-modal";
import styles from "../../styles.module.scss";
import { toast } from "sonner";
import { api } from "@/services/api";
import { StockItem } from "../StockList";

interface EditProps {
  item: StockItem;
  types: string[];
  onClose(): void;
  onSuccess(): Promise<void>;
}

export default function EditItemModal({ item, types, onClose, onSuccess }: EditProps) {
  const [form, setForm] = useState({ name: item.name, unit: item.unit, type: item.type });
  const [saving, setSaving] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.unit || !form.type) {
      return toast.error("Preencha todos os campos");
    }

    setSaving(true);
    try {
      await api.put(`/stock/${item.id}`, {
        name: form.name,
        unit: form.unit,
        type: form.type
      });
      toast.success("Item atualizado com sucesso");
      onClose();
      await onSuccess();
    } catch (err) {
      toast.error("Erro ao atualizar item");
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
          <input name="name" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Tipo
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="">Selecione</option>
            {types.map(t => (
              <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </label>
        <label>
          Unidade
          <input name="unit" value={form.unit} onChange={handleChange} />
        </label>
        <footer className={styles.formFooter}>
          <button type="button" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
        </footer>
      </form>
    </ReactModal>
  );
}