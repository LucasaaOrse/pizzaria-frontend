
import styles from "./page.module.scss";
import logoImg from "/public/logo.svg"
import Image from "next/image";
import Link from "next/link";
import { api } from "@/services/api";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"

export default function Home() {

  async function handleLogin(formData:FormData) {
    "use server"
    const email = formData.get("email")
    const password = formData.get("password")

    if(email === " " || password === " "){
      return
    }

    try {
      
      const response = await api.post("/login", {
        email,
        password
      })

      if(!response){
        return
      }

    
      const expressTime = 60 * 60 * 24 * 30 * 1000
      const cookiesStore = await cookies()
      cookiesStore.set("session", response.data.token, {
        maxAge: expressTime,
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production"
      })
      
    } catch (error) {
      console.log(error)
      return
    }

    redirect("/dashboard")
  }

  return (
    <>
      <div className={styles.contaninerCenter}>
        <Image
        src={logoImg}
        alt="Logo"
        />
        <section className={styles.login}>
          <form action={handleLogin}>
            <input type="email" name="email" id="email" required placeholder="Digite o seu email" className={styles.input}/>
            <input type="password" name="password" id="password" required placeholder="**********" className={styles.input}/>

            <button type="submit">
              Acessar
            </button>
          </form>

          <Link href="/signup" className={styles.text} >
            Não possuil conta? Cadastre-se
          </Link>

        </section>


      </div>
    
    </>
  );
}
