"use client";

import React, { useState } from "react";
import ReactModal from "react-modal";
import styles from "../../styles.module.scss";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";

import AddQuantityModal    from "../AddQuantityModal";
import RemoveQuantityModal from "../RemoveQuantityModal";
import EditItemModal       from "../EditItemModal";
import ConfirmDeleteModal  from "../ConfirmDeleteModal";

import { Plus, Minus, Edit3, Trash2 } from "lucide-react";

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  type_id: number;
  type_name: string;
}

export interface StockItemType {
  id: string;
  name: string;
}

interface Props {
  initialItems: StockItem[];
  initialTypes: StockItemType[];
}

export default function StockList({ initialItems, initialTypes }: Props) {
  // Lista e filtros
  const [items, setItems]       = useState<StockItem[]>(initialItems);
  const [types]                 = useState<StockItemType[]>(initialTypes);
  const [filter, setFilter]     = useState<string>("todos");
  const [loading, setLoading]   = useState(false);

  // Modal de criação
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm]             = useState({
    name: "",
    typeId: "",
    unit: "",
    quantity: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Modais de ação
  const [addItem,    setAddItem]    = useState<StockItem | null>(null);
  const [removeItem, setRemoveItem] = useState<StockItem | null>(null);
  const [editItem,   setEditItem]   = useState<StockItem | null>(null);
  const [delItem,    setDelItem]    = useState<StockItem | null>(null);

  const token = getCookieClient()

  // 1) callbacks de update otimista
  function addQuantityLocally(id: string, delta: number) {
  setItems(old =>
    old.map(i => {
      if (i.id !== id) return i;
      const current = typeof i.quantity === "string"
        ? parseFloat(i.quantity)
        : i.quantity;
      return { ...i, quantity: current + delta };
    })
  );
}
  function removeQuantityLocally(id: string, delta: number) {
  setItems(old =>
    old.map(i => {
      if (i.id !== id) return i;
      const current = typeof i.quantity === "string"
        ? parseFloat(i.quantity)
        : i.quantity;
      return { ...i, quantity: current - delta };
    })
  );
}
  function updateItemLocally(updated: StockItem) {
    setItems(old =>
      old.map(i => i.id === updated.id ? updated : i)
    );
  }
  function deleteItemLocally(id: string) {
    setItems(old => old.filter(i => i.id !== id));
  }

  // Refetch
  async function loadData() {
    const token = await getCookieClient()
    setLoading(true);
    try {
      const res = await api.get<StockItem[]>("/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },});
      setItems(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar estoque");
    } finally {
      setLoading(false);
    }
  }

  // Filtra por tipo
  const filtered = filter === "todos"
    ? items
    : items.filter(i => i.type_name === filter);

  // Criação de item novo
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>
  ) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.typeId || !form.unit || Number(form.quantity) <= 0) {
      return toast.error("Preencha todos os campos corretamente");
    }
    setSubmitting(true);
    try {
      await api.post("/stock", {
        name: form.name,
        type_id:  Number(form.typeId),
        unit: form.unit,
        quantity: Number(form.quantity)
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },});
      toast.success("Item adicionado ao estoque");
      setCreateOpen(false);
      setForm({ name:"", typeId:"", unit:"", quantity:"" });
      await loadData();
    } catch {
      toast.error("Erro ao adicionar item");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <section className={styles.header}>
        <h1>Estoque</h1>
        <div>
          <button onClick={loadData} title="Atualizar">
            <RefreshCcw size={24} color="#3fffa3" />
          </button>
          <button onClick={() => setCreateOpen(true)} title="Adicionar item">
            <Plus size={24} color="#3fffa3" />
          </button>
        </div>
      </section>

      {/* Filtros */}
      <div className={styles.filters}>
        <button
          className={filter==="todos" ? styles.activeFilter : ""}
          onClick={()=>setFilter("todos")}
        >
          Todos
        </button>
        {types.map(t => (
          <button
            key={t.id}
            className={filter === t.name ? styles.activeFilter : ""}
            onClick={() => setFilter(t.name)}
          >
            {t.name[0].toUpperCase() + t.name.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista */}
      <section className={styles.listOrders}>
        {loading
          ? <span className={styles.emptyItem}>Carregando…</span>
          : filtered.length === 0
            ? <span className={styles.emptyItem}>Nenhum item encontrado</span>
            : filtered.map(item => (
                <div key={item.id} className={styles.orderRow}>
                  <div className={styles.orderItem}>
                    <div
                      className={styles.tag}
                      style={{
                        backgroundColor:
                          item.type_name === "ingrediente" ? "#f1c40f" : "#3fffa3"
                      }}
                    />
                    <span>
                      {item.name}
                      <small style={{ marginLeft: 12 }}>
                        {item.quantity} {item.unit}
                      </small>
                    </span>
                  </div>
                  <div className={styles.rowActions}>
                    <button
                      title="Adicionar quantidade"
                      onClick={() => setAddItem(item)}
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      title="Remover quantidade"
                      onClick={() => setRemoveItem(item)}
                    >
                      <Minus size={20} />
                    </button>
                    <button
                      title="Editar item"
                      onClick={() => setEditItem(item)}
                    >
                      <Edit3 size={20} />
                    </button>
                    <button
                      title="Deletar item"
                      onClick={() => setDelItem(item)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
        }
      </section>

      {/* Modal de criar novo item */}
      <ReactModal
        isOpen={createOpen}
        onRequestClose={() => setCreateOpen(false)}
        ariaHideApp={false}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>Novo Item</h2>
        <form onSubmit={handleCreate} className={styles.form}>
          <label>
            Nome
            <input name="name"  value={form.name}  onChange={handleChange} />
          </label>
          <label>
            Tipo
            <select name="typeId" value={form.typeId} onChange={handleChange}>
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
            <input name="unit" value={form.unit} onChange={handleChange} />
          </label>
          <label>
            Quantidade
            <input
              name="quantity"
              type="number"
              min="0"
              step="0.01"
              value={form.quantity}
              onChange={handleChange}
            />
          </label>
          <footer className={styles.formFooter}>
            <button
              type="button"
              onClick={()=>setCreateOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Salvando…" : "Salvar"}
            </button>
          </footer>
        </form>
      </ReactModal>

      {/* Modais de ação */}
      {addItem && (
        <AddQuantityModal
          item={addItem}
          onClose={() => setAddItem(null)}
          onSuccess={loadData}
          onOptimistic={addQuantityLocally}
        />
      )}
      {removeItem && (
        <RemoveQuantityModal
          item={removeItem}
          onClose={() => setRemoveItem(null)}
          onSuccess={loadData}
          onOptimistic={removeQuantityLocally}
        />
      )}
      {editItem && (
      <EditItemModal
        item={editItem}
        types={initialTypes}          // array de StockItemType
        onClose={() => setEditItem(null)}
        onSuccess={loadData}
        onOptimistic={updateItemLocally}
      />
    )}

      {delItem && (
        <ConfirmDeleteModal
          item={delItem}
          onClose={() => setDelItem(null)}
          onSuccess={loadData}
          onOptimistic={deleteItemLocally}
        />
      )}
    </main>
  );
}
