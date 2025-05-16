// src/app/dashboard/stock/page.tsx
 "use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { api }       from "@/services/api";
import StockList, { StockItem } from "./components/StockList";

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getCookie("session") as string | undefined;

  useEffect(() => {
    if (!token) {
      // sem token, redireciona pro login
      window.location.href = "/";
      return;
    }

    Promise.all([
      api.get<StockItem[]>("/stock",       { headers: { Authorization: `Bearer ${token}` } }),
      api.get<string[]>   ("/stock/types", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([rItems, rTypes]) => {
        setItems(rItems.data);
        setTypes(rTypes.data);
      })
      .catch(err => {
        console.error(err);
        alert("Falha ao carregar estoque");
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <StockList
      initialItems={items}
      initialTypes={types}
      loading={loading}
    />
  );
}