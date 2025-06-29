'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import API from "@/lib/services/api"

export const LoginForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      console.log("User already logged in, redirecting...")
      navigate("/dashboard", { replace: true })
    }
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  console.log("🚀 handleSubmit triggered")

  if (!formData.email.includes("@")) {
    toast.error("Please enter a valid email address")
    return
  }

  if (formData.password.length < 6) {
    toast.error("Password must be at least 6 characters")
    return
  }

  setIsLoading(true)

  try {
    const response = await API.post("/auth/login/", formData)

    const { access, refresh } = response.data // ✅ FIXED

    if (!access || !refresh) throw new Error("Missing tokens")

    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)

    toast.success("Login successful!")
    navigate("/dashboard", { replace: true })

  } catch (error: any) {
    console.error("❌ Login error:", error?.response || error) // ✅ BETTER LOG

    if (error?.response?.status === 404) {
      toast.error("Login endpoint not found (404). Check your backend URL.")
      return
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      "Incorrect email or password"

    toast.error(message)
  } finally {
    setIsLoading(false)
  }
}


  return (
    <form
      onSubmit={(e) => {
        console.log("📨 onSubmit triggered")
        handleSubmit(e)
      }}
      className="space-y-4 w-full"
      autoComplete="off"
    >
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nachosYellow" size={16} />
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Username"
          className="pl-10 border-2 border-nachosYellow rounded-full text-sm placeholder-gray-400"
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nachosYellow" size={16} />
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Password"
          className="pl-10 pr-10 border-2 border-nachosYellow rounded-full text-sm placeholder-gray-400"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          onClick={() => setShowPassword(!showPassword)}
          aria-label="Toggle Password"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex justify-center mt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-[200px] h-10 bg-black text-white rounded-full hover:bg-gray-900"
        >
          {isLoading ? "Processing..." : "Login"}
        </Button>
      </div>
    </form>
  )
}
