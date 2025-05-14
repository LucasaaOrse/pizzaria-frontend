"use client";

import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { RefreshCcw } from "lucide-react";
import { OrderProps } from "@/lib/order.type";
import { Modalorder } from "../modal";
import { use } from "react";
import { OrderContext } from "@/providers/order";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { ChatWindow } from "../chatWindow/ChatWindow";
import { ChatButton } from "../ChatButton/ChatButton"; // ✅ Importado

interface Props {
  orders: OrderProps[];
}

let socket: any;

export function Orders({ orders }: Props) {
  const { isOpen, onRequestOpen } = use(OrderContext);
  const [currentOrders, setCurrentOrders] = useState<OrderProps[]>(orders);
  const [chatOrder, setChatOrder] = useState<{id: string; table: number} | null>(null);
  const [hasUnread, setHasUnread] = useState(false); // ✅ Novo estado
  const router = useRouter();

  useEffect(() => {
    socket = io("https://pizzaria-backend-production-bccd.up.railway.app");

    socket.on("connect", () => {
      console.log("✅ Conectado ao socket:", socket.id);
    });

    socket.on("newOrder", (order: OrderProps) => {
  setCurrentOrders((prev) => {
    const alreadyExists = prev.find((o) => String(o.id) === String(order.id));
    
    // Se já existe, substitui (útil quando o draft muda de true → false)
    if (alreadyExists) {
      return prev.map((o) =>
        String(o.id) === String(order.id) ? order : o
      );
    }

    // Se não existe, adiciona normalmente
    return [order, ...prev];
  });
});

    socket.on("orderFinished", ({ id }: { id: string }) => {
      console.log("Recebi orderFinished:", id);
      setCurrentOrders((prev) =>
        prev.filter((o) => String(o.id) !== String(id))
      );
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderFinished");
      socket.disconnect();
    };
  }, []);

  async function handleDetailOrder(order_id: string) {
    await onRequestOpen(order_id);
  }

  function handleRefresh() {
    router.refresh();
    toast.success("Pedidos atualizados");
  }

  const activeDraft = currentOrders.find((o) => o.draft);

  return (
    <>
      <main className={styles.container}>
        <section className={styles.header}>
          <h1>Últimos pedidos</h1>
          <button onClick={handleRefresh}>
            <RefreshCcw size={24} color="#3fffa3" />
          </button>
        </section>

        <section className={styles.listOrders}>
          {currentOrders.length === 0 && (
            <span className={styles.emptyItem}>
              Nenhum pedido aberto no momento
            </span>
          )}

          {currentOrders.map((order) => (
            <div key={order.id} className={styles.orderRow}>
              <button
                className={styles.orderItem}
                onClick={() => order.draft ? undefined : handleDetailOrder(order.id)}
                style={{ cursor: order.draft ? "not-allowed" : "pointer", opacity: order.draft ? 0.6 : 1 }}
              >
                <div
                  className={styles.tag}
                  style={{
                    backgroundColor: order.draft ? "#f1c40f" : "#3fffa3",
                  }}
                />
                <span>
                  Mesa {order.table}{" "}
                  <small style={{ color: "#ccc", marginLeft: 8 }}>
                    {order.draft ? "pendente" : "enviado"}
                  </small>
                </span>
              </button>

              {order.draft && (
                <button
                  className={styles.chatIcon}
                  onClick={() => setChatOrder({ id: String(order.id), table: order.table })}
                  title="Chat Mesa"
                >
                  💬
                </button>
              )}
            </div>
          ))}
        </section>
      </main>

      {isOpen && <Modalorder />}

      {/* ✅ Chat flutuante */}
      {activeDraft && (
        <ChatButton
          onClick={() => setChatOrder({ id: String(activeDraft.id), table: activeDraft.table })}
          hasUnread={hasUnread}
        />
      )}

      {chatOrder && (
        <ChatWindow
          orderId={chatOrder.id}
          tableNumber={chatOrder.table}
          onClose={() => setChatOrder(null)}
          setHasUnread={setHasUnread} // ✅ Define leitura
          isOpen={!!chatOrder} // ✅ Identifica se o chat está visível
        />
      )}
    </>
  );
}
