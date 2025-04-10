
import { Form } from "./components/form"
import { getCookiesServer } from "@/lib/cookieServer"
import { api } from "@/services/api"

export default async function Product(){

    const token = await getCookiesServer()

    const response = await api.get("/category", {
        headers:{
            Authorization: `Bearer ${token}`
        }
    })

    return(
        <main>
            <Form categories={response.data}/>
        </main>
    )
}