import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface LoginResponse {
  data: {
    access: string;
    refresh: string;
    username: string;
  };
  message?: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      console.log("✅ Already logged in, redirecting...");
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("🚀 handleSubmit triggered");

    const { email, password } = formData;

    if (!email.includes("@")) {
      toast.error("Bruh, that's not an email.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("https://nachos-backend-production.up.railway.app/api/v1/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result: LoginResponse = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Store tokens
      localStorage.setItem("access_token", result.data.access);
      localStorage.setItem("refresh_token", result.data.refresh);
      localStorage.setItem("username", result.data.username);

      toast.success(`Welcome back, ${result.data.username}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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
  );
};
