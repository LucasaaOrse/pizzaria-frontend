// src/services/api.ts
import axios from "axios";

const serverBaseURL = process.env.API_URL ?? "https://pizzaria-backend-production-bccd.up.railway.app";
const clientBaseURL = process.env.NEXT_PUBLIC_API_URL ?? "https://pizzaria-backend-production-bccd.up.railway.app";

export const api = axios.create({
  baseURL: typeof window === "undefined" ? serverBaseURL : clientBaseURL,
  withCredentials: true,
});