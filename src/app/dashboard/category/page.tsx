
import styles from "./styles.module.scss"
import { Button } from "../components/button" 
import { getCookiesServer } from "@/lib/cookieServer"
import { redirect } from "next/navigation"

import { api } from "@/services/api"

export default function Category(){

    async function handleRedisterCategory(formData: FormData) {
        "use server"
        
        const name = formData.get("name")

        if(name === "") return;

        const data = {
            name: name
        }

        const token = await getCookiesServer()

        await api.post("/category", data, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        }).catch((error) => {
            console.log(error)
            return
        })
        
        redirect("/dashboard")
        
    }
    return(
        <main className={styles.container}>
            <h1>Nova categoria</h1>
            <form action={handleRedisterCategory} className={styles.form}>
                <input type="text" name="name" id="name" placeholder="Nome da Categoria ex: Pizza" required className={styles.input}/>
                <Button name="Cadastrar"/>
            </form>
        </main>
    )
}

