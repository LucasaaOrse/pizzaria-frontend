"use client";

import React, { useState } from "react";
import styles from "./styles.module.scss";
import { RefreshCcw } from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  type: "ingrediente" | "produto";
  quantity: number;
}

interface Props {
  items: StockItem[];
}


export function Stock({ items }: Props) {
  const [filter, setFilter] = useState<"todos" | "ingrediente" | "produto">("todos");

  const filteredItems = filter === "todos" ? items : items.filter(item => item.type === filter);

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1>Estoque</h1>
        <button onClick={() => location.reload()}>
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
        <button
          className={filter === "ingrediente" ? styles.activeFilter : ""}
          onClick={() => setFilter("ingrediente")}
        >
          Ingredientes
        </button>
        <button
          className={filter === "produto" ? styles.activeFilter : ""}
          onClick={() => setFilter("produto")}
        >
          Produtos Prontos
        </button>
      </div>

      <section className={styles.listOrders}>
        {filteredItems.length === 0 ? (
          <span className={styles.emptyItem}>Nenhum item encontrado</span>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className={styles.orderRow}>
              <div className={styles.orderItem}>
                <div
                  className={styles.tag}
                  style={{
                    backgroundColor: item.type === "ingrediente" ? "#f1c40f" : "#3fffa3"
                  }}
                />
                <span>
                  {item.name}
                  <small style={{ marginLeft: 12 }}>Qtd: {item.quantity}</small>
                </span>
              </div>

              <button className={styles.chatIcon} title="Adicionar quantidade">
                ➕
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
