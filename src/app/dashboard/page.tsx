
import { Orders } from "./components/orders"
import { api } from "@/services/api"
import { getCookiesServer } from "@/lib/cookieServer"
import { OrderProps } from "@/lib/order.type"

export const dynamic = "force-dynamic";

async function getOrders(): Promise<OrderProps[] | []> {
    try {

        const token = await getCookiesServer()

        const response = await api.get("/order/pending", {
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        return response.data || [];

    } catch (error) {
        console.log(error)
        return []
    }
}

export default async function Dashboard(){

    const orders = await getOrders()

    return(
        <>
         <Orders orders={orders} />   

        </>
    )
}

