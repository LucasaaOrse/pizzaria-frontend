// src/app/dashboard/stock/page.tsx
import { redirect } from "next/navigation";
import { api } from "@/services/api";
import StockList, { StockItem } from "./components/StockList";
import { getCookies } from "cookies-next/server";

export default async function StockPage() {
  // 1) pega token httpOnly

  const token =  getCookies()
  if (!token) {
    // se não tiver, manda pro login
    redirect("/");
  }

  // 2) busca os dados protegidos
  const [resItems, resTypes] = await Promise.all([
    api.get<StockItem[]>("/stock", {
      headers: { Authorization: `Bearer ${token}` }
    }),
    api.get<string[]>("/stock/types", {
      headers: { Authorization: `Bearer ${token}` }
    })
  ]);

  return (
    <StockList
      initialItems={resItems.data}
      initialTypes={resTypes.data}
    />
  );
}
