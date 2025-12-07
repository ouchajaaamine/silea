"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, Eye, EyeOff, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const result = await login(email, password)

      if (result.success) {
        toast.success("Login successful!")
        router.push("/admin/dashboard")
      } else {
        toast.error(result.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      // Demo mode - simulate successful login
      toast.success("Demo login successful!")
      localStorage.setItem("silea_token", "demo-token")
      localStorage.setItem("silea_user", JSON.stringify({ id: 1, name: "Admin", email: email }))
      router.push("/admin/dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#556B2F]/10 via-background to-[#D6A64F]/5">
      {/* Background Pattern */}
      <div className="moroccan-pattern fixed inset-0" />

      {/* Floating Elements */}
      <div className="fixed top-1/4 left-10 w-32 h-32 rounded-full bg-[#D6A64F]/10 blur-3xl float-animation" />
      <div className="fixed bottom-1/4 right-10 w-40 h-40 rounded-full bg-[#556B2F]/10 blur-3xl float-animation" style={{ animationDelay: "2s" }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 shadow-lg shadow-[#556B2F]/30 overflow-hidden">
            <img
              src="/logo.png"
              alt="Silea Logo"
              className="w-full h-full object-contain p-4"
            />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#556B2F]">Silea Admin</h1>
          <p className="text-muted-foreground mt-1">Sign in to manage your store</p>
        </div>

        <Card className="glass-card border-white/30">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="font-serif text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@silea.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-glass pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-glass pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-[#556B2F]" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-[#556B2F] hover:text-[#D6A64F] transition-colors">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full btn-primary h-12" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#556B2F]/10">
              <p className="text-center text-sm text-muted-foreground">
                Demo credentials: admin@silea.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Store */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-[#556B2F] transition-colors"
          >
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  )
}

