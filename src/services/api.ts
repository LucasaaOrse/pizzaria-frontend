import axios from "axios";

export const api = axios.create({
     baseURL: "pizzaria-backend-production-bccd.up.railway.app"
})