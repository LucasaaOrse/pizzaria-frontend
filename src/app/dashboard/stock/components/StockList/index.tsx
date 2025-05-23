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
  minimum_quantity?: number; // novo campo
}

export interface StockItemType {
  id: string;
  name: string;
}

interface Props {
  initialItems: StockItem[];
  initialTypes: StockItemType[];
}

const GROUPS: Record<string, string[]> = {
  Todos: [],  
  Ingredientes: ["ingrediente"],  
  Bebidas: ["bebida alcoólica", "refrigerante", "suco", "água"],  
  Outros: ["material de limpeza", "embalagem", "outro"],  
};

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
    quantity: "",
    minimum: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Modais de ação
  const [addItem,    setAddItem]    = useState<StockItem | null>(null);
  const [removeItem, setRemoveItem] = useState<StockItem | null>(null);
  const [editItem,   setEditItem]   = useState<StockItem | null>(null);
  const [delItem,    setDelItem]    = useState<StockItem | null>(null);

  const token = getCookieClient()

  const isUnitInteger = (unit: string) => ["un", "u", "unid", "unidade"].includes(unit.toLowerCase());
  const UNITS = ["g", "kg", "ml", "L", "un"];
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
  function getQuantityColor(item: StockItem) {
  const quantity = Number(item.quantity);
  const minimum = Number(item.minimum_quantity || 0);
  if (quantity === 0) return "gray";
  if (quantity < minimum) return "red";
  if (quantity === minimum) return "orange";
  return "green";
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

 const filtered = filter === "Todos"
  ? items
  : items.filter(i => (GROUPS[filter] || []).includes(i.type_name));

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
        quantity: Number(form.quantity),
        minimum_quantity: Number(form.minimum) || 0
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },});
      toast.success("Item adicionado ao estoque");
      setCreateOpen(false);
      setForm({ name:"", typeId:"", unit:"", quantity:"", minimum: "" });
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
        <div className={styles.headerButtons}>
          <button onClick={loadData} title="Atualizar">
            <RefreshCcw size={24} color="#3fffa3" />
          </button>
          <button onClick={() => setCreateOpen(true)} title="Adicionar item">
            <Plus size={24} color="#3fffa3" />
          </button>
        </div>
      </section>

      {/* Filtros agrupados */}
        <div className={styles.filters}>
          {Object.keys(GROUPS).map(group => (
            <button
              key={group}
              className={filter === group ? styles.activeFilter : ""}
              onClick={() => setFilter(group)}
            >
              {group}
            </button>
          ))}
        </div>

      {/* Lista */}
      <section className={styles.listOrders}>
  {loading ? (
    <span className={styles.emptyItem}>Carregando…</span>
  ) : filtered.length === 0 ? (
    <span className={styles.emptyItem}>Nenhum item encontrado</span>
  ) : (
    <>
      {/* Itens em estoque */}
      {filtered
        .filter(item => Number(item.quantity) > 0)
        .map(item => (
          <div key={item.id} className={styles.orderRow}>
            <div className={styles.orderItem}>
              <div
                className={styles.tag}
                style={{ backgroundColor: getQuantityColor(item) }}
              />
              <span>
                {item.name}
                <small
                  style={{
                    marginLeft: 12,
                    fontWeight: "bold",
                    color: Number(item.quantity) === 0 ? "red" : "gray"
                  }}
                >
                  {item.quantity} {item.unit}
                </small>
              </span>
            </div>
            <div className={styles.rowActions}>
              <button title="Adicionar quantidade" onClick={() => setAddItem(item)}>
                <Plus size={20} />
              </button>
              <button title="Editar item" onClick={() => setEditItem(item)}>
                <Edit3 size={20} />
              </button>
              <button title="Deletar item" onClick={() => setDelItem(item)}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

      {/* Itens fora de estoque */}
      {filtered.some(item => Number(item.quantity) === 0) && (
        <>
          <h3 style={{ marginTop: "2rem", color: "red" }}>Itens fora de estoque:</h3>
          {filtered
            .filter(item => Number(item.quantity) === 0)
            .map(item => (
              <div key={item.id} className={styles.orderRow}>
                <div className={styles.orderItem}>
                  <div className={styles.tag} style={{ backgroundColor: "#ccc" }} />
                  <span>
                    {item.name}
                    <small
                      style={{
                        marginLeft: 12,
                        fontWeight: "bold",
                        color: "gray"
                      }}
                    >
                      0 {item.unit}
                    </small>
                  </span>
                </div>
                <div className={styles.rowActions}>
                  <button title="Adicionar quantidade" onClick={() => setAddItem(item)}>
                    <Plus size={20} />
                  </button>
                  <button title="Editar item" onClick={() => setEditItem(item)}>
                    <Edit3 size={20} />
                  </button>
                  <button title="Deletar item" onClick={() => setDelItem(item)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
        </>
      )}
    </>
  )}
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
            <select name="unit" value={form.unit} onChange={handleChange}>
              <option value="">Selecione</option>
              {UNITS.map(u => (
                <option key={u} value={u}>
                  {u.toUpperCase()}
                </option>
              ))}
            </select>

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
          <label>
            Mínimo em estoque
            <input
              name="minimum"
              type="number"
              min="0"
              step="0.01"
              value={form.minimum}
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
