// components/Orders.tsx
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
import clsx from "clsx";

interface Props {
  orders: OrderProps[];
}

let socket: any;

export function Orders({ orders }: Props) {
  const { isOpen, onRequestOpen } = use(OrderContext);
  const [currentOrders, setCurrentOrders] = useState<OrderProps[]>(orders);

  // mantém quais chats estão abertos
  const [openChats, setOpenChats] = useState<string[]>([]);

  // ids de pedidos com mensagens não lidas
  const [unreadIds, setUnreadIds] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    socket = io("https://pizzaria-backend-production-bccd.up.railway.app");

    // 1) quando chegar newMessage, se o chat não estiver aberto, marca como não lido
    socket.on("newMessage", (raw: any & { room: string }) => {
      console.log("🏷️ newMessage em Orders.tsx:", {
      room: raw.room,
      openChats,
      unreadBefore: unreadIds
    });
      if (!openChats.includes(raw.room)) {
      setUnreadIds(prev => {
        const next = prev.includes(raw.room) ? prev : [...prev, raw.room];
        console.log("➕ marcando como não lido:", raw.room, "→", next);
        return next;
      });
    }
  });

    socket.on("connect", () => {
      console.log("✅ Socket conectado:", socket.id);
    });

    socket.on("newOrder", (order: OrderProps) => {
      setCurrentOrders(prev => {
        const exists = prev.find(o => String(o.id) === String(order.id));
        if (exists) {
          return prev.map(o =>
            String(o.id) === String(order.id) ? order : o
          );
        }
        return [order, ...prev];
      });
    });

    socket.on("orderFinished", ({ id }: { id: string }) => {
      setCurrentOrders(prev =>
        prev.filter(o => String(o.id) !== String(id))
      );
      // opcional: ao finalizar, limpa badge caso exista
      setUnreadIds(prev => prev.filter(x => x !== String(id)));
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderFinished");
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [openChats]);

  async function handleDetailOrder(order_id: string) {
    await onRequestOpen(order_id);
  }

  function handleRefresh() {
    router.refresh();
    toast.success("Pedidos atualizados");
  }

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

          {currentOrders.map(order => (
            <div key={order.id} className={styles.orderRow}>
              <button
                className={styles.orderItem}
                onClick={() =>
                  order.draft ? undefined : handleDetailOrder(order.id)
                }
                style={{
                  cursor: order.draft ? "not-allowed" : "pointer",
                  opacity: order.draft ? 0.6 : 1
                }}
              >
                <div
                  className={styles.tag}
                  style={{
                    backgroundColor: order.draft ? "#f1c40f" : "#3fffa3"
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
                  className={clsx(styles.chatIcon, {
                    [styles.chatIconUnread]: unreadIds.includes(String(order.id))
                  })}
                  onClick={() => {
                    const id = String(order.id);
                    setOpenChats(prev => {
                      if (!prev.includes(id)) return [...prev, id];
                      return prev;
                    });
                    // limpa a badge ao abrir
                    setUnreadIds(prev => prev.filter(x => x !== id));
                  }}
                  title="Chat Mesa"
                >
                  💬
                  {unreadIds.includes(String(order.id)) && (
                    <span className={styles.badge} />
                  )}
                </button>
              )}
            </div>
          ))}
        </section>
      </main>

      {isOpen && <Modalorder />}

      {openChats.map(id => {
        const o = currentOrders.find(o => String(o.id) === id)!;
        return (
          <ChatWindow
            key={id}
            orderId={id}
            tableNumber={o.table}
            onClose={() =>
              setOpenChats(prev => prev.filter(x => x !== id))
            }
          />
        );
      })}
    </>
  );
}
