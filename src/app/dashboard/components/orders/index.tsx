"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./styles.module.scss";
import { RefreshCcw, Trash2 } from "lucide-react";
import { OrderProps } from "@/lib/order.type";
import { Modalorder } from "../modal";
import { use } from "react";
import { OrderContext } from "@/providers/order";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { ChatWindow } from "../chatWindow/ChatWindow";
import clsx from "clsx";
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";

interface Props {
  orders: OrderProps[];
}

let socket: any;

export function Orders({ orders }: Props) {
  const { isOpen, onRequestOpen } = use(OrderContext);
  const [currentOrders, setCurrentOrders] = useState<OrderProps[]>(orders);
  const [orderToDelete, setOrderToDelete] = useState<OrderProps | null>(null);


  // mantém quais chats estão abertos
  const [openChats, setOpenChats] = useState<string[]>([]);

  // ids de pedidos com mensagens não lidas
  const [unreadIds, setUnreadIds] = useState<string[]>([]);

  const router = useRouter();

  const openChatsRef = useRef<string[]>([]);
  useEffect(() => {
    openChatsRef.current = openChats;
  }, [openChats]);

   useEffect(() => {
    socket = io("https://pizzaria-backend-production-bccd.up.railway.app");

    socket.on("connect", () => {
      console.log("✅ Socket conectado:", socket.id);
    });

    

    orders.forEach(o => {
      if (o.draft) {
        socket.emit("joinRoom", { room: String(o.id) });
      }
    });
    // 3) listener de newMessage lê sempre openChatsRef.current
    socket.on("newMessage", (raw: any & { room: string }) => {
      console.groupCollapsed("✉️ [Orders] newMessage recebido");
      console.log("raw:", raw);
      console.log("raw.room:", raw.room);
      console.log("openChatsRef.current:", openChatsRef.current);
      console.log("unreadIds antes:", unreadIds);
      if (!openChatsRef.current.includes(raw.room)) {
        setUnreadIds(prev => {
          const next = prev.includes(raw.room) ? prev : [...prev, raw.room];
          console.log("→ marcando como não lido:", raw.room, "→", next);
          return next;
        });
      }
      console.groupEnd();
    });

    // 4) mantém seus handlers de newOrder e orderFinished
    socket.on("newOrder", (order: OrderProps) => {
      setCurrentOrders(prev => {
        const exists = prev.find(o => String(o.id) === String(order.id));
        if (exists) {
          return prev.map(o =>
            String(o.id) === String(order.id) ? order : o
          );
        }
        socket.emit("joinRoom", { room: String(order.id) });
        return [order, ...prev];
      });
    });

    socket.on("orderFinished", ({ id }: { id: string }) => {
      setCurrentOrders(prev => prev.filter(o => String(o.id) !== String(id)));
      setUnreadIds(prev => prev.filter(x => x !== String(id)));
      socket.emit("leaveRoom", { room: String(id) });
    });

    socket.on("orderDeleted", ({ id }: { id: string }) => {
      setCurrentOrders(prev => {
        const order = prev.find(o => String(o.id) === String(id));
        if (order) {
          toast.info(`Pedido da mesa ${order.table} foi cancelado`);
        }
        return prev.filter(o => String(o.id) !== String(id));
      });

      setUnreadIds(prev => prev.filter(x => x !== String(id)));
      setOpenChats(prev => prev.filter(x => x !== String(id)));
      socket.emit("leaveRoom", { room: String(id) });

      console.log("🗑️ Pedido removido via socket:", id);
    });

    return () => {
      socket.off("orderDeleted");
      socket.disconnect();
    };
  }, []);

  async function handleDetailOrder(order_id: string) {
    await onRequestOpen(order_id);
  }

  async function confirmDeleteOrder() {
    if (!orderToDelete) return;
    const token = getCookieClient()

    try {
      await api.delete(
        `/order/${orderToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCurrentOrders(prev =>
        prev.filter(o => o.id !== orderToDelete.id)
      );
      socket.emit("leaveRoom", { room: String(orderToDelete.id) });
      toast.success(`Pedido da mesa ${orderToDelete.table} excluído`);
    } catch (err) {
      console.error("Erro ao excluir pedido:", err);
      toast.error("Não foi possível excluir o pedido");
    } finally {
      setOrderToDelete(null);
    }
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

          {[...currentOrders]
              .sort((a, b) => {
                // pedidos prontos (draft: false) vão para cima
                if (!a.draft && b.draft) return -1;
                if (a.draft && !b.draft) return 1;

                // se os dois forem iguais (ambos prontos ou ambos pendentes),
                // ordena pelo id crescente (mais antigo primeiro)
                return Number(a.id) - Number(b.id);
              })
              .map(order => (
            <div key={order.id} className={styles.orderRow}>
  <button
    className={styles.orderItem}
    onClick={() =>
      order.draft ? undefined : handleDetailOrder(order.id)
    }
    style={{
      cursor: order.draft ? "not-allowed" : "pointer",
      opacity: order.draft ? 0.7 : 1
    }}
    disabled={order.draft}
  >
    <div
      className={styles.tag}
      style={{
        backgroundColor: order.draft ? "#f39c12" : "#2ecc71"
      }}
    />
    <span>
      Mesa {order.table}
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
        setOpenChats(prev => (
          prev.includes(id) ? prev : [...prev, id]
        ));
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

  <button
    className={styles.deleteOrderBtn}
    title="Cancelar pedido"
    onClick={() => setOrderToDelete(order)}
  >
    <Trash2 size={20} color="#e74c3c" />
  </button>
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
      {/* ❗ Delete confirmation modal */}
      {orderToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirmar exclusão</h2>
            <p>
              Deseja realmente cancelar o pedido da mesa{" "}
              <strong>{orderToDelete.table}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className={styles.cancelBtn}
              >
                Não
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                className={styles.confirmDeleteBtn}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
