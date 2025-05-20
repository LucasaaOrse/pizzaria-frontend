"use client";

import { useState, useTransition } from "react";
import styles from "./page.module.scss";

export default function LoginForm({
  handleLogin,
}: {
  handleLogin: (formData: FormData) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({ email: "", password: "" });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = new FormData();
    data.append("email", formData.email);
    data.append("password", formData.password);

    startTransition(() => {
      handleLogin(data);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Digite o seu email"
        className={styles.input}
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        name="password"
        placeholder="**********"
        className={styles.input}
        required
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? (
          <span className={styles.loadingText}>
            Carregando<span className={styles.dots}></span>
          </span>
        ) : (
          "Acessar"
        )}
      </button>
    </form>
  );
}
