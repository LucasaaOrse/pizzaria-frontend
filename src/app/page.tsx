"use client";

import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import styles from "./page.module.scss";
import Image from "next/image";
import logoImg from "/public/logo.svg";

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const email = form.get("email")?.toString().trim();
    const password = form.get("password")?.toString().trim();
    if (!email || !password) return;

    try {
      // Faz POST /login e backend seta cookie
      await api.post(
        "/login",
        { email, password },
        { withCredentials: true } // garante envio/recebimento de cookie
      );
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Falha no login:", err);
      alert(err.response?.data?.error || "Erro ao fazer login");
    }
  }

  return (
    <div className={styles.containerCenter}>
      <Image src={logoImg} alt="Logo" />
      <section className={styles.login}>
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Seu email"
            className={styles.input}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Sua senha"
            className={styles.input}
            required
          />
          <button type="submit">Acessar</button>
        </form>
      </section>
    </div>
  );
}
