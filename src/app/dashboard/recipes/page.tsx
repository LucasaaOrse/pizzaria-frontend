// page.tsx (RecipeManager atualizado)
"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import styles from "./page.module.scss";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Edit3 } from "lucide-react";
import { getCookieClient } from "@/lib/cookieClient";
import EditRecipeModal from "./components/editModalRecipe";

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
  banner: string;
  recipe: Ingredient[];
}

export default function RecipeManager() {
  const [products, setProducts] = useState<RecipeProduct[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RecipeProduct | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const token = await getCookieClient();
        const res = await api.get<RecipeProduct[]>("/product/all-with-recipes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar receitas");
      }
    }
    load();
  }, []);

  const toggle = (id: number) => setOpenId(prev => (prev === id ? null : id));

  const handleEditRecipe = async (product: RecipeProduct) => {
    try {
      const token = await getCookieClient();
      const res = await api.get<StockItem[]>("/stock", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ingredientes = res.data.filter(item => item.type_name === "ingrediente");
      setStockItems(ingredientes);
      setSelectedProduct(product);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar ingredientes do estoque");
    }
  };

  const fetchProducts = async () => {
    try {
      const token = await getCookieClient();
      const res = await api.get<RecipeProduct[]>("/product/all-with-recipes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar receitas");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveSuccess = () => {
    fetchProducts();
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Receitas</h1>
      <div className={styles.grid}>
        {products.map(prod => {
          const isOpen = openId === prod.id;
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
                          <button className={styles.iconBtn} onClick={() => handleEditRecipe(prod)}>
                            <Edit3 size={16} />
                          </button>
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

      {selectedProduct && (
        <EditRecipeModal
          isOpen={showModal}
          product={selectedProduct}
          stockItems={stockItems}
          onClose={() => setShowModal(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </main>
  );
}