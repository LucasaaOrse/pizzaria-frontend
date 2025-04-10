
import { Header } from "./components/header"
import { OrderProvider } from "@/providers/order"

export default function dashboardLayout({ children }: { children: React.ReactNode }){
    return(
        <>
        <OrderProvider>
        <Header/>
            {children}
        </OrderProvider>
        </>

    )
}
