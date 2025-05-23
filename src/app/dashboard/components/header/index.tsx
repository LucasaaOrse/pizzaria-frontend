"use client"
import styles from "./styles.module.scss"
import Link from "next/link"
import Image from "next/image"
import logoImg from "/public/Logo da Pizzaria Forno di Vino.png"
import { LogOutIcon } from "lucide-react"
import { deleteCookie } from "cookies-next"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function Header(){

    const router = useRouter()

    async function handleLogout() {
        deleteCookie("session", {path: "/"})
        toast.success("Logout feito com sucesso")
        router.replace("/")
    }

    return(
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <Link href="/dashboard">
                    <Image 
                        className={styles.logo}
                        alt="Logo Sujeito pizza"
                        src={logoImg}
                        height={60}
                        priority={true}
                        quality={100}
                    />
                </Link>
                <nav>
                    <Link href="/dashboard/category" >
                        Categoria
                    </Link>
                    <Link href="/dashboard/product">
                        Produto
                    </Link>
                    <Link href="/dashboard/stock">
                        Estoque
                    </Link>
                    <Link href="/dashboard/recipes">
                        Receitas
                    </Link>

                    <form action={handleLogout}>
                        <button type="submit">
                            <LogOutIcon size={24} color="#fff"/>
                        </button>
                    </form>
                </nav>

            </div>
        </header>

    )
}