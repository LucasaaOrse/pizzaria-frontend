// src/services/api.ts
import axios from "axios";

const serverBaseURL = process.env.API_URL;            // para Server Actions
const clientBaseURL = process.env.NEXT_PUBLIC_API_URL; // para browser

export const api = axios.create({
  baseURL: typeof window === "undefined" ? serverBaseURL : clientBaseURL,
  withCredentials: true,
});