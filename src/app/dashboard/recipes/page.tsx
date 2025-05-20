"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import styles from "./page.module.scss";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Edit3, PlusCircle } from "lucide-react";
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

type Mode = 'add' | 'edit';

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
  const [modalMode, setModalMode] = useState<Mode>('add');
  const [selectedProduct, setSelectedProduct] = useState<RecipeProduct | null>(null);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [existingIngredients, setExistingIngredients] = useState<{ stockItemId: number; quantity: number }[]>([]);

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

  const toggle = (id: number) => setOpenId(prev => (prev === id ? null : id));

  const openModal = async (product: RecipeProduct, mode: Mode) => {
    try {
      const token = await getCookieClient();
      const res = await api.get<StockItem[]>("/stock", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ingredientes = res.data.filter(item => item.type_name === "ingrediente");
      setStockItems(ingredientes);

      setModalMode(mode);
      setSelectedProduct(product);
      if (mode === 'edit') {
        // preparar existing ingredients
        setExistingIngredients(
          product.recipe.map(i => ({ stockItemId: i.id, quantity: i.quantity }))
        );
      } else {
        setExistingIngredients([]);
      }

      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar ingredientes do estoque");
    }
  };

  const handleSaveSuccess = () => {
    setShowModal(false);
    fetchProducts();
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Receitas</h1>
      <div className={styles.grid}>
        {products.map(prod => {
          const isOpen = openId === prod.id;
          const hasRecipe = prod.recipe.length > 0;
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
                  {hasRecipe ? (
                    <ul className={styles.list}>
                      {prod.recipe.map(item => (
                        <li key={item.id} className={styles.item}>
                          <span>
                            {item.name} — {item.quantity} {item.unit}
                          </span>
                          <button
                            className={styles.iconBtn}
                            onClick={() => openModal(prod, 'edit')}
                          >
                            <Edit3 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.empty}>Nenhum ingrediente cadastrado.</p>
                  )}
                  <button
                    className={styles.editRecipeBtn}
                    onClick={() => openModal(prod, hasRecipe ? 'edit' : 'add')}
                  >
                    {hasRecipe ? 'Editar receita' : 'Adicionar receita'}
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
          mode={modalMode}
          existingIngredients={existingIngredients}
          onClose={() => setShowModal(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </main>
  );
}
