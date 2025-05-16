// src/app/dashboard/stock/page.tsx
import { getCookiesServer } from "@/lib/cookieServer";
import { redirect } from "next/navigation";
import { api } from "@/services/api";
import StockList, { StockItem } from "./components/StockList";

export const dynamic = "force-dynamic";

type StockItemType = { id: string; name: string };

export default async function StockPage() {
  // 1) pega token httpOnly

  const token = await getCookiesServer()
  if (!token) {
    // se não tiver, manda pro login
    redirect("/");
  }

  // 2) busca os dados protegidos
  const [resItems, resTypes] = await Promise.all([
    api.get<StockItem[]>("/stock", {
      headers: { Authorization: `Bearer ${token}` }
    }),
    api.get<StockItemType[]>("/stock/types", {
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
