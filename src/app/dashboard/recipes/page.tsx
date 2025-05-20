"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import styles from "./page.module.scss";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Edit3, Trash2 } from "lucide-react";
import { getCookieClient } from "@/lib/cookieClient";

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

interface StockItem {
  id: number;
  name: string;
  unit: string;
  type_name: string;
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
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RecipeProduct | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const token = await getCookieClient();
        const res = await api.get<RecipeProduct[]>("/product/all-with-recipes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar receitas");
      }
    }
    load();
  }, []);

  async function handleEditRecipe(product: RecipeProduct) {
    try {
      const token = await getCookieClient();
      const res = await api.get<StockItem[]>("/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filtra apenas itens do tipo 'ingrediente'
      const ingredientes = res.data.filter(item => item.type_name === "ingrediente");

      setStockItems(ingredientes);
      setSelectedProduct(product);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar ingredientes do estoque");
    }
  }

  function toggle(id: number) {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
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
                <img
                  src={prod.banner}
                  alt={prod.name}
                  className={styles.banner}
                />
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
                    <p className={styles.empty}>
                      Nenhum ingrediente cadastrado.
                    </p>
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
                  <button
                    className={styles.editRecipeBtn}
                    onClick={() => handleEditRecipe(prod)}
                  >
                    Editar receita
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && selectedProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Editar Receita: {selectedProduct.name}</h2>
            <ul>
              {stockItems.map(item => (
                <li key={item.id} className={styles.modalItem}>
                  {item.name} ({item.unit}) —{' '}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Quantidade"
                  />
                </li>
              ))}
            </ul>
            <div className={styles.modalActions}>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
              <button>Salvar Receita</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
