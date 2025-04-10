import { cookies } from "next/headers"

export async function getCookiesServer(){
    const cookiesStore = await cookies()
    const token = cookiesStore.get("session")?.value

    return token || null;
}