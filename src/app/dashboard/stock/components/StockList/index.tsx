"use client";

import React, { useState } from "react";
import ReactModal from "react-modal";
import styles from "./styles.module.scss";
import { RefreshCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  type: string;
  quantity: number;
}

interface Props {
  initialItems: StockItem[];
  initialTypes: string[];
}

export default function StockList({ initialItems, initialTypes }: Props) {
  const [items, setItems]   = useState<StockItem[]>(initialItems);
  const [types] = useState<string[]>(initialTypes);
  const [filter, setFilter] = useState<string>("todos");
  const [loading, setLoading] = useState(false);

  // modal / form
  const [modalOpen,   setModalOpen]   = useState(false);
  const [form,        setForm]        = useState({ name:"", type:"", unit:"", quantity:"" });
  const [submitting,  setSubmitting]  = useState(false);

  // refetch dos dois endpoints
  async function loadData() {
    setLoading(true);
    try {
      const [resItems] = await Promise.all([
        api.get<StockItem[]>("/stock"),
      ]);
      setItems(resItems.data);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao carregar estoque");
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "todos"
    ? items
    : items.filter(i => i.type === filter);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>
  ) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.type || !form.unit || Number(form.quantity) <= 0) {
      return toast.error("Preencha todos os campos corretamente");
    }
    setSubmitting(true);
    try {
      await api.post("/stock", {
        name: form.name,
        type: form.type,
        unit: form.unit,
        quantity: Number(form.quantity)
      });
      toast.success("Item adicionado ao estoque");
      setModalOpen(false);
      setForm({ name:"", type:"", unit:"", quantity:"" });
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
          <button onClick={() => setModalOpen(true)} title="Adicionar">
            <Plus size={24} color="#3fffa3" />
          </button>
        </div>
      </section>

      {/* Filtros */}
      <div className={styles.filters}>
        <button
          className={filter==="todos"?styles.activeFilter:""}
          onClick={()=>setFilter("todos")}
        >
          Todos
        </button>
        {types.map(t=>(
          <button
            key={t}
            className={filter===t?styles.activeFilter:""}
            onClick={()=>setFilter(t)}
          >
            {t[0].toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista */}
      <section className={styles.listOrders}>
        {loading
          ? <span className={styles.emptyItem}>Carregando…</span>
          : filtered.length===0
            ? <span className={styles.emptyItem}>Nenhum item encontrado</span>
            : filtered.map(item=>(
                <div key={item.id} className={styles.orderRow}>
                  <div className={styles.orderItem}>
                    <div
                      className={styles.tag}
                      style={{
                        backgroundColor: item.type==="ingrediente"
                          ? "#f1c40f"
                          : "#3fffa3"
                      }}
                    />
                    <span>
                      {item.name}
                      <small style={{ marginLeft:12 }}>
                        {item.quantity} {item.unit}
                      </small>
                    </span>
                  </div>
                  <button
                    className={styles.chatIcon}
                    title="Adicionar quantidade"
                    onClick={()=>{/* futuramente abrir modal de edição */}}
                  >
                    ➕
                  </button>
                </div>
              ))
        }
      </section>

      {/* Modal de criação */}
      <ReactModal
        isOpen={modalOpen}
        onRequestClose={()=>setModalOpen(false)}
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
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="">Selecione</option>
              {types.map(t=>(
                <option key={t} value={t}>
                  {t[0].toUpperCase()+t.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Unidade
            <input name="unit"  value={form.unit}  onChange={handleChange} />
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
              onClick={()=>setModalOpen(false)}
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
    </main>
  );
}
