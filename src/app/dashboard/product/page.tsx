// page.tsx
import { ProductManager } from "./components/form"
import { getCookiesServer } from "@/lib/cookieServer"
import { api } from "@/services/api"

export default async function Product() {
  const token = await getCookiesServer()

  const [categoriesResponse, productsResponse] = await Promise.all([
    api.get("/category", { headers: { Authorization: `Bearer ${token}` } }),
    api.get("/product", { headers: { Authorization: `Bearer ${token}` } })
  ])

  return (
    <main>
      <ProductManager
        categories={categoriesResponse.data}
        initialProducts={productsResponse.data}
      />
    </main>
  )
}
