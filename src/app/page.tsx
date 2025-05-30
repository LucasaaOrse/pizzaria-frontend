// app/(auth)/page.tsx
import styles from "./page.module.scss";
import logoImg from "/public/Logo forno di vino.png";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/services/api";
import LoginForm from "./dashboard/components/loginform"; // novo componente

export default function Home() {
  async function handleLogin(formData: FormData) {
    "use server";

    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    if (!email || !password) return;

    try {
      const response = await api.post("/login", { email, password });
      const token = response.data.token;
      if (!token) return;

      const maxAge = 60 * 60 * 24 * 30;
      const cookieStore = await cookies();
      cookieStore.set("session", token, {
        maxAge,
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });
    } catch (err) {
      console.error("Erro no login:", err);
      return;
    }

    redirect("/dashboard");
  }

  return (
  <div className={styles.loginPage}>
    <div className={styles.loginCard}>
      <div className={styles.imageSection}>
        <Image
          src={logoImg}
          alt="Logo da Pizzaria Forno di Vino"
          width={300}
          priority
          className={styles.logo}
        />
      </div>
      <div className={styles.formSection}>
        <h1>Bem-vindo de volta</h1>
        <LoginForm handleLogin={handleLogin} />
        <Link href="/signup" className={styles.text}>
          Não possui conta? Cadastre-se
        </Link>
      </div>
    </div>
  </div>
);
}
