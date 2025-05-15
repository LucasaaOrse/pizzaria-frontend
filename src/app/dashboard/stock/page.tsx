// src/app/dashboard/stock/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import { RefreshCcw } from "lucide-react";
import { api } from "@/services/api";

interface StockItem {
  id: string;
  name: string;
  unit: string;
  type: string;
  quantity: number;
}

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("todos");
  const [loading, setLoading] = useState<boolean>(false);

  async function loadData() {
    setLoading(true);
    try {
      const [resItems, resTypes] = await Promise.all([
        api.get<StockItem[]>("/stock"),
        api.get<string[]>("/stock/types"),
      ]);
      setItems(resItems.data);
      setTypes(resTypes.data);
    } catch (err) {
      console.error("Erro ao carregar estoque:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = filter === "todos"
    ? items
    : items.filter(item => item.type === filter);

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1>Estoque</h1>
        <button onClick={loadData} title="Atualizar">
          <RefreshCcw size={24} color="#3fffa3" />
        </button>
      </section>

      <div className={styles.filters}>
        <button
          className={filter === "todos" ? styles.activeFilter : ""}
          onClick={() => setFilter("todos")}
        >
          Todos
        </button>
        {types.map(t => (
          <button
            key={t}
            className={filter === t ? styles.activeFilter : ""}
            onClick={() => setFilter(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <section className={styles.listOrders}>
        {loading ? (
          <span className={styles.emptyItem}>Carregando...</span>
        ) : filteredItems.length === 0 ? (
          <span className={styles.emptyItem}>Nenhum item encontrado</span>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className={styles.orderRow}>
              <div className={styles.orderItem}>
                <div
                  className={styles.tag}
                  style={{
                    backgroundColor:
                      item.type === "ingrediente" ? "#f1c40f" : "#3fffa3"
                  }}
                />
                <span>
                  {item.name}
                  <small style={{ marginLeft: 12 }}>
                    {item.quantity} {item.unit}
                  </small>
                </span>
              </div>

              <button
                className={styles.chatIcon}
                title="Adicionar quantidade"
                onClick={() => {
                  // aqui você pode exibir um prompt ou modal
                  const q = prompt("Informe a quantidade a adicionar:");
                  if (!q) return;
                  // depois, chamar: api.post(`/stock/${item.id}/addStock`, { quantity: Number(q) })
                }}
              >
                ➕
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
