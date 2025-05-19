// app/(auth)/page.tsx  ou src/app/page.tsx
import styles from "./page.module.scss";
import logoImg from "/public/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/services/api";
import { redirect } from "next/navigation";

export default function Home() {
  // Server Action
  async function handleLogin(formData: FormData) {
    "use server";

    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    if (!email || !password) return;

    try {
      // Chama o backend que já faz res.cookie("session", token)
      await api.post("/login", { email, password }, {
        withCredentials: true, // garante que o Set-Cookie do backend seja enviado
      });
    } catch (err: any) {
      console.error("Erro no login:", err);
      return;
    }

    // redireciona para dashboard
    redirect("/dashboard");
  }

  return (
    <div className={styles.contaninerCenter}>
      <Image src={logoImg} alt="Logo" />
      <section className={styles.login}>
        {/* chama o handleLogin no server */}
        <form action={handleLogin}>
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
