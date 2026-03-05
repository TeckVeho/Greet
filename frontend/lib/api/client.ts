"use client"

import axios, { type InternalAxiosRequestConfig } from "axios"

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"

export const apiClient = axios.create({
  baseURL,
  withCredentials: false,
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
)

