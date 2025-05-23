
import Image from "next/image"
import Link from "next/link"
import logoImg from "/public/Logo da Pizzaria Forno di Vino.png"
import { redirect } from "next/navigation"

import styles from "../page.module.scss"
import { api } from "@/services/api"

export default function signup(){

    async function handleRegister(formData: FormData){
        "use server"
        
        const name = formData.get("name")
        const email = formData.get("email")
        const password = formData.get('password')

        if(name === " " || email === " " || password === " "){
            return
        }

        try {
            await api.post("/users", {
                name,
                email,
                password
            })
        } catch (error) {
            console.log(error)
        }

        redirect("/")
    }

    return(
        <>

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
        <h1>Criando a sua conta</h1>
        <input type="text" name="name" id="name" required placeholder="Digite o seu nome" className={styles.input}/>
        <input type="email" name="email" id="email" required placeholder="Digite o seu email" className={styles.input}/>
        <input type="password" name="password" id="password" required placeholder="**********" className={styles.input}/>
        <button type="submit">
              Cadastrar
        </button>

        <Link href="/" className={styles.text}>
          Já possui uma conta? Faça o login
        </Link>
      </div>
    </div>
  </div>


        </>

    )
}
