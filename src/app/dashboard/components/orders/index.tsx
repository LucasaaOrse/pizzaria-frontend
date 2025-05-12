"use client"
import styles from "./styles.module.scss"
import { RefreshCcw } from "lucide-react"
import { OrderProps } from "@/lib/order.type"
import { Modalorder } from "../modal"
import { use } from "react"
import { OrderContext } from "@/providers/order"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { io } from "socket.io-client"
import { useEffect, useState } from "react"

interface Props{
    orders: OrderProps[]
}

let socket: any

export function Orders({ orders }: Props){
    const { isOpen, onRequestOpen } = use(OrderContext)
    const [currentOrders, setCurrentOrders] = useState<OrderProps[]>(orders)
    const router = useRouter()
    
    useEffect(() => {
    socket = io("https://pizzaria-backend-production-bccd.up.railway.app") // Altere para seu IP se for mobile

    socket.on("connect", () => {
      console.log("✅ Conectado ao socket:", socket.id)
    })

    socket.on("newOrder", (order: OrderProps) => {
      console.log("📦 Novo pedido recebido:", order)
      setCurrentOrders(prev => [order, ...prev])
      toast.success(`Novo pedido na mesa ${order.table}`)
    })

    return () => {
      socket.off("newOrder")
      socket.disconnect()
    }
  }, [])

    async function handleDetailOrder(order_id: string){
       await onRequestOpen(order_id)
    }

    function handleRefresh(){
        router.refresh()
        toast.success("Pedidos atualizados")
    }

    return(
        <>
        <main className={styles.container}>
            <section className={styles.header}>
                <h1>Últimos pedidos</h1>
                <button>
                    <RefreshCcw size={24} color="#3fffa3" onClick={handleRefresh}/>
                </button>
            </section>

            <section className={styles.listOrders}>
                {orders.length === 0 && (
                    <span className={styles.emptyItem}>
                        Nenhum pedido aberto no momento
                    </span>
                )}


                {orders.map( order => (
                    <button key={order.id} className={styles.orderItem} onClick={() => handleDetailOrder(order.id)}> 
                    <div className={styles.tag}></div>
                    <span>Mesa {order.table}</span>
                    </button>
                ) )}

            </section>
        </main>
    
        { isOpen && <Modalorder/>}           
    </>            
    )

}