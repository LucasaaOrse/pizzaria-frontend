"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import styles from "./page.module.scss";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Edit3, Trash2 } from "lucide-react";

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeProduct {
  id: number;
  name: string;
  banner: string;          // url da imagem
  recipe: Ingredient[];    // veio do `all-with-recipes`
}

export default function RecipeManager() {
  const [products, setProducts] = useState<RecipeProduct[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<RecipeProduct[]>("/products/all-with-recipes");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar receitas");
      }
    }
    load();
  }, []);

  function toggle(id: number) {
    setExpanded(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Receitas</h1>
      <div className={styles.grid}>
        {products.map(prod => {
          const isOpen = expanded.has(prod.id);
          return (
            <div key={prod.id} className={styles.card}>
              <header className={styles.header}>
                <img src={prod.banner} alt={prod.name} className={styles.banner} />
                <div className={styles.info}>
                  <h2>{prod.name}</h2>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => toggle(prod.id)}
                    aria-label={isOpen ? "Fechar" : "Abrir"}
                  >
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </header>

              {isOpen && (
                <div className={styles.body}>
                  {prod.recipe.length === 0 ? (
                    <p className={styles.empty}>Nenhum ingrediente cadastrado.</p>
                  ) : (
                    <ul className={styles.list}>
                      {prod.recipe.map(item => (
                        <li key={item.id} className={styles.item}>
                          <span>
                            {item.name} — {item.quantity} {item.unit}
                          </span>
                          <div className={styles.actions}>
                            <button title="Editar">
                              <Edit3 size={16} />
                            </button>
                            <button title="Remover">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button className={styles.editRecipeBtn}>Editar receita</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
