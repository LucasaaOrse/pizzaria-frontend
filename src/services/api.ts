import axios from "axios";

export const api = axios.create({
     baseURL: "pizzaria-backend-production-3bd4.up.railway.app"
})