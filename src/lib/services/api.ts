import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://nachos-backend-production.up.railway.app/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // if needed for cookies
})

export default API
