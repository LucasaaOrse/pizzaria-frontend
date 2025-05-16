// app/(auth)/page.tsx
"use client";

import styles from "./page.module.scss";
import logoImg from "/public/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    if (!email || !password) return;

    try {
      // Chama o backend que agora seta o cookie 'session'
      await api.post(
        "/login",
        { email, password },
        { withCredentials: true }
      );
      // Se não lançou erro, o cookie foi gravado e podemos redirecionar
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Erro no login:", err);
      alert(err.response?.data?.error || "Falha ao fazer login");
    }
  }

  return (
    <div className={styles.contaninerCenter}>
      <Image src={logoImg} alt="Logo" />

      <section className={styles.login}>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Digite o seu email"
            className={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="**********"
            className={styles.input}
            required
          />
          <button type="submit">Acessar</button>
        </form>

        <Link href="/signup" className={styles.text}>
          Não possui conta? Cadastre-se
        </Link>
      </section>
    </div>
  );
}
