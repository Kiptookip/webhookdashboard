"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Waves, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(username, password)

      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-ocean-50 to-ocean-100">
      <div className="absolute inset-0 bg-pattern-overlay opacity-5 pointer-events-none"></div>

      <div className="flex items-center mb-8">
        <Waves className="h-10 w-10 text-ocean-500 mr-3" />
        <h1 className="text-3xl font-bold text-ocean-700">CSV Webhook Portal</h1>
      </div>

      <Card className="w-full max-w-md ocean-card bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-ocean-700">Login</CardTitle>
          <CardDescription className="text-center text-ocean-500">
            Enter your credentials to access the portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-ocean-700">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-400">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-ocean-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-ocean-200 focus:border-ocean-400 focus:ring-ocean-300"
                  required
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ocean-400">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-ocean-500 hover:bg-ocean-600 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="mt-6 text-sm text-ocean-500">Please enter your credentials to log in</p>
    </div>
  )
}
