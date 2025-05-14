"use client";

import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import styles from "./ChatWindow.module.scss";
import { api } from "@/services/api";

interface ChatWindowProps {
  orderId: string;     // mantém a sala do socket
  tableNumber: number; // mostra no header
  onClose: () => void;
  setHasUnread: React.Dispatch<React.SetStateAction<boolean>>; // ✅ Adicione isto
  isOpen: boolean; // ✅ Adicione isto
}

interface RawMessage {
  author: "garcom" | "cozinha";
  message: string;
  timestamp: number;
}

interface Message {
  id: string;
  author: "garcom" | "cozinha";
  message: string;
  timestamp: number;
}

const socket = io("https://pizzaria-backend-production-bccd.up.railway.app",{
  withCredentials: true,
  transports: ["websocket"]
}
);

function getTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function ChatWindow({ orderId, tableNumber, onClose }: ChatWindowProps) {
  const [unreadChats, setUnreadChats] = useState<Record<string,boolean>>({});
  const [chat, setChat] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 🔄 1) busca histórico do backend
   (async () => {
      const token = getTokenFromCookie();
      if (!token) {
        console.error("Sem token, não posso buscar histórico");
        return;
      }
      try {
        const { data: history } = await api.get<RawMessage[]>(
          `/messages/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setChat(
          history.map((h) => ({
            id: String(h.timestamp),
            author: h.author,
            message: h.message,
            timestamp: h.timestamp,
          }))
        );
      } catch (err) {
        console.error("Erro ao buscar histórico de mensagens:", err);
      }
    })();

  socket.emit("joinRoom", { room: String(orderId) });

  socket.on("newMessage", (raw: any) => {
    console.log("🔴 [web] newMessage recebido:", raw);

    const msg: Message = {
      id: String(raw.timestamp),
      author: raw.author,
      message: raw.message,
      timestamp: raw.timestamp,
    };
    setChat(prev => [...prev, msg]);
  });

  return () => {
    socket.off("newMessage");
    socket.emit("leaveRoom", { room: orderId });
  };
}, [orderId]);

function send() {
  if (!text.trim()) return;
  const payload = {
    room: orderId,
    author: "cozinha" as const,
    message: text,
    timestamp: Date.now(),
  };

  console.log("🔵 [web] emitindo sendMessage:", payload);

  socket.emit("sendMessage", payload);
  setChat(prev => [
    ...prev,
    { id: String(payload.timestamp), author: payload.author, message: payload.message, timestamp: payload.timestamp }
  ]);
  setText("");
}


  return (
<div className={styles.overlay}>
      <div className={styles.window}>
        <header className={styles.header}>
          {/* use tableNumber aqui */}
          <h2>Chat Mesa {tableNumber}</h2>
          <button onClick={onClose}>×</button>
        </header>
        <div className={styles.messages}>
          {chat.map((m) => (
            <div
              key={m.id}
              className={`${styles.message} ${
                m.author === "cozinha" ? styles.outgoing : styles.incoming
              }`}
            >
              <span className={styles.author}>{m.author}</span>
              <p>{m.message}</p>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
        <footer className={styles.footer}>
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send}>Enviar</button>
        </footer>
      </div>
    </div>
  );
}
