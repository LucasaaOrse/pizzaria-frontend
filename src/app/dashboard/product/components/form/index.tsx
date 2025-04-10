"use client"

import { ChangeEvent, useState } from "react"
import styles from "./styles.module.scss"
import { UploadCloud } from "lucide-react"
import Image from "next/image"
import { Button } from "@/app/dashboard/components/button"
import { api } from "@/services/api"
import { getCookieClient } from "@/lib/cookieClient"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CategoryProps {
  id: string
  name: string
}

interface Props {
  categories: CategoryProps[]
}

export function Form({ categories }: Props) {
  const router = useRouter()
  const [image, setImage] = useState<File>()
  const [previewImage, setPreviewImage] = useState("")

  async function handleRegisterProduct(formData: FormData) {
    const categoryIndex = formData.get("category")?.toString()
    const name = formData.get("name")?.toString()
    const price = formData.get("price")?.toString()
    const description = formData.get("description")?.toString()

    if (
      !categoryIndex ||
      !name ||
      !price ||
      !description ||
      !image
    ) {
      toast.warning("Preencha todos os campos")
      return
    }

    const category_id = categories[Number(categoryIndex)]?.id
    if (!category_id) {
      toast.error("Categoria inválida")
      return
    }

    const data = new FormData()
    data.append("name", name)
    data.append("category_id", category_id)
    data.append("price", price)
    data.append("description", description)
    data.append("file", image)

    try {
      const token = await getCookieClient()

      await api.post("/product", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      })

      toast.success("Produto cadastrado com sucesso")
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error)
      toast.error("Erro ao cadastrar produto")
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      if (
        selected.type !== "image/jpeg" &&
        selected.type !== "image/png"
      ) {
        toast.warning("Formato de imagem inválido (use JPEG ou PNG)")
        return
      }

      setImage(selected)
      setPreviewImage(URL.createObjectURL(selected))
    }
  }

  return (
    <main className={styles.container}>
      <h1>Novo produto</h1>

      <form className={styles.form} action={handleRegisterProduct}>
        <label className={styles.labelImage}>
          <span>
            <UploadCloud size={30} color="#FFF" />
          </span>
          <input
            type="file"
            name="file"
            accept="image/png, image/jpeg"
            required
            onChange={handleFile}
          />

          {previewImage && (
            <Image
              alt="Preview da imagem"
              src={previewImage}
              className={styles.preview}
              fill
              quality={100}
              priority
            />
          )}
        </label>

        <select name="category" id="category">
          {categories.map((category, index) => (
            <option key={category.id} value={index}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          placeholder="Digite o nome do produto"
          required
          className={styles.input}
        />

        <input
          type="text"
          name="price"
          placeholder="Digite o preço do produto"
          required
          className={styles.input}
        />

        <textarea
          name="description"
          id="description"
          placeholder="Digite a descrição do produto"
          required
          className={styles.input}
        />

        <Button name="Cadastrar produto" />
      </form>
    </main>
  )
}
