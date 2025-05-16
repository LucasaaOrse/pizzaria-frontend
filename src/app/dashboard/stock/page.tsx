// src/app/dashboard/stock/page.tsx

import { getCookiesServer } from "@/lib/cookieServer"
import { api } from "@/services/api";
import StockList, { StockItem } from "./components/StockList";

export default async function StockPage() {
  // 1) pega token httpOnly

   const token = await getCookiesServer()

  // 2) busca os dados protegidos
  const [resItems, resTypes] = await Promise.all([
    api.get<StockItem[]>("/stock", {
      headers:{
                Authorization: `Bearer ${token}`
            }
    }),
    api.get<string[]>("/stock/types", {
      headers:{
                Authorization: `Bearer ${token}`
            }
    })
  ]);

  return (
    <StockList
      initialItems={resItems.data}
      initialTypes={resTypes.data}
    />
  );
}
