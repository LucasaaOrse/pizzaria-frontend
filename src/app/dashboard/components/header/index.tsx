"use client";
import styles from "./styles.module.scss";
import Link from "next/link";
import Image from "next/image";
import logoImg from "/public/Logo forno di vino.png";
import { LogOutIcon } from "lucide-react";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    deleteCookie("session", { path: "/" });
    toast.success("Logout feito com sucesso");
    router.replace("/");
  }

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/dashboard">
          <Image
            src={logoImg}
            alt="Logo Pizzaria"
            height={60}
            className={styles.logo}
            priority
          />
        </Link>

        <nav className={styles.nav}>
          <Link href="/dashboard/category">Categoria</Link>
          <Link href="/dashboard/product">Produto</Link>
          <Link href="/dashboard/stock">Estoque</Link>
          <Link href="/dashboard/recipes">Receitas</Link>

          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Sair"
          >
            <LogOutIcon size={22} />
          </button>
        </nav>
      </div>
    </header>
  );
}
