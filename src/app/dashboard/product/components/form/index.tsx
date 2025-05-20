"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import styles from "./styles.module.scss";
import { UploadCloud, Trash2, Pencil, PlusCircle } from "lucide-react";
import { Button } from "@/app/dashboard/components/button";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { toast } from "sonner";

interface CategoryProps {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  banner: string;
  category_id: string;
}

interface Props {
  categories: CategoryProps[];
  initialProducts: Product[];
}

export function ProductManager({ categories, initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formState, setFormState] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    category: "",
  });

  async function handleSubmit(formData: FormData) {
    const token = await getCookieClient();
    const isEditing = !!formState.id;

    if (!formState.name || !formState.price || !formState.description || !formState.category) {
      toast.warning("Preencha todos os campos");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formState.name);
      data.append("price", formState.price);
      data.append("description", formState.description);
      data.append("category_id", formState.category);

      if (image) {
        data.append("file", image);
      }

      if (isEditing) {
        await api.put(`/product/${formState.id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        toast.success("Produto atualizado");
      } else {
        await api.post("/product", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        toast.success("Produto criado");
      }

      const refreshed = await api.get("/product/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(refreshed.data);

      resetForm();
      setIsModalOpen(false);
    } catch {
      toast.error("Erro ao salvar produto");
    }
  }

  function resetForm() {
    setFormState({ id: "", name: "", price: "", description: "", category: "" });
    setImage(null);
    setPreviewImage("");
    fileInputRef.current?.value && (fileInputRef.current.value = "");
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.warning("Formato inválido");
      return;
    }
    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  function handleEdit(product: Product) {
    setFormState({
      id: product.id,
      name: product.name,
      price: String(product.price),
      description: product.description,
      category: product.category_id,
    });
    setPreviewImage(product.banner);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    const token = await getCookieClient();
    try {
      await api.delete(`/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
      toast.success("Produto deletado");
    } catch {
      toast.error("Erro ao deletar produto");
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.productList}>
        <div className={styles.headerRow}>
          <h2>Produtos cadastrados</h2>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className={styles.addButton}>
            <PlusCircle size={20} />
            Novo produto
          </button>
        </div>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <Image src={product.banner} alt={product.name} width={60} height={60} unoptimized />
            <strong>{product.name}</strong>
            <span>R$ {product.price.toFixed(2)}</span>
            <div className={styles.actions}>
              <button onClick={() => handleEdit(product)}><Pencil size={16} /></button>
              <button onClick={() => handleDelete(product.id)}><Trash2 size={16} color="red" /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h1>{formState.id ? "Editar produto" : "Novo produto"}</h1>
            <form className={styles.form} action={handleSubmit}>
              <label className={styles.labelImage}>
                <span><UploadCloud size={30} color="#FFF" /></span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} />
                {previewImage && (
                  <Image src={previewImage} alt="Preview" fill className={styles.preview} unoptimized />
                )}
              </label>

              <select value={formState.category} onChange={(e) => setFormState(s => ({ ...s, category: e.target.value }))}>
                <option value="">Selecione uma categoria</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input className={styles.input} value={formState.name} onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))} placeholder="Nome" />
              <input className={styles.input} type="number" step="0.01" value={formState.price} onChange={(e) => setFormState(s => ({ ...s, price: e.target.value }))} placeholder="Preço" />
              <textarea value={formState.description} onChange={(e) => setFormState(s => ({ ...s, description: e.target.value }))} placeholder="Descrição" />
              <div className={styles.modalActions}>
                <Button name={formState.id ? "Atualizar" : "Cadastrar produto"} />
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
