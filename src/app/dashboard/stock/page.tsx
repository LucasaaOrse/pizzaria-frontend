// src/app/dashboard/stock/page.tsx
import { getCookiesServer } from "@/lib/cookieServer";
import { redirect }         from "next/navigation";
import { api }              from "@/services/api";
import StockList, { StockItem } from "./components/StockList";

// 1) força SSR e impede SSG p/ essa rota
export const dynamic   = 'force-dynamic';
export const revalidate = 0;

export default async function StockPage() {
  // 2) pega o cookie HTTP‑only no servidor
  const token = await getCookiesServer();
  if (!token) {
    redirect("/");       // manda pro login se não estiver autenticado
  }

  // 3) faz as duas chamadas protegidas com o token nos headers
  const [resItems, resTypes] = await Promise.all([
    api.get<StockItem[]>("/stock",       { headers:{ Authorization:`Bearer ${token}` } }),
    api.get<string[]>   ("/stock/types", { headers:{ Authorization:`Bearer ${token}` } }),
  ]);

  return (
    <StockList
      initialItems={resItems.data}
      initialTypes={resTypes.data}
    />
  );
}
