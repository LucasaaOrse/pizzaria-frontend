"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import styles from "../../../page.module.scss";
import Image from "next/image";
import logoImg from "/public/logo.svg";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha email e senha.");
      return;
    }

    try {
      await api.post(
        "/login",
        { email, password },
        { withCredentials: true }
      );
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Falha no login:", err);
      setError(err.response?.data?.error || "Erro ao fazer login");
    }
  }

  return (
    <div className={styles.contaninerCenter}>
      <Image src={logoImg} alt="Logo" />

      <section className={styles.login}>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Digite o seu email"
            className={styles.input}
            value={email}
            onChange={e => setEmail(e.currentTarget.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="**********"
            className={styles.input}
            value={password}
            onChange={e => setPassword(e.currentTarget.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit">Acessar</button>
        </form>

        <Link href="/signup" className={styles.text}>
          Não possui conta? Cadastre-se
        </Link>
      </section>
    </div>
  );
}
