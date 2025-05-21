"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Waves,
  LayoutDashboard,
  Upload,
  MessageSquare,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { SettingsProvider } from "@/lib/settings-context"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    router.push("/login")
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  if (!user) {
    return null // Don't render anything until auth check completes
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/upload", label: "Upload CSV", icon: Upload },
    { href: "/dashboard/responses", label: "Responses", icon: MessageSquare },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/users", label: "User Management", icon: Users },
  ]

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-ocean-200 shadow-sm">
          <div className="flex items-center">
            <Waves className="h-6 w-6 text-ocean-500 mr-2" />
            <h1 className="text-xl font-bold text-ocean-700">CSV Portal</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6 text-ocean-600" />
          </Button>
        </div>

        <div className="flex h-[calc(100vh-4rem)] lg:h-screen">
          {/* Sidebar for mobile (overlay) */}
          <div
            className={cn(
              "lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-200",
              sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <aside
            className={cn(
              "bg-white border-r border-ocean-200 flex flex-col transition-all duration-300 ease-in-out z-50",
              collapsed ? "w-20" : "w-64",
              isMobile ? "fixed h-full" : "h-screen",
              isMobile && !sidebarOpen && "transform -translate-x-full",
              isMobile && sidebarOpen && "transform translate-x-0",
            )}
          >
            {/* Sidebar Header */}
            <div
              className={cn(
                "flex items-center p-4 border-b border-ocean-200",
                collapsed ? "justify-center" : "justify-between",
              )}
            >
              {!collapsed && (
                <div className="flex items-center">
                  <Waves className="h-6 w-6 text-ocean-500 mr-2" />
                  <h2 className="text-lg font-bold text-ocean-700">CSV Portal</h2>
                </div>
              )}
              {collapsed && <Waves className="h-6 w-6 text-ocean-500" />}

              {isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className={collapsed ? "hidden" : ""}
                >
                  <X className="h-5 w-5 text-ocean-600" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className={collapsed ? "hidden" : ""}>
                  <ChevronLeft className="h-5 w-5 text-ocean-600" />
                </Button>
              )}
            </div>

            {/* Collapse button for desktop (when collapsed) */}
            {collapsed && !isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mt-2 mx-auto">
                <ChevronRight className="h-5 w-5 text-ocean-600" />
              </Button>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            collapsed ? "px-2" : "px-4",
                            isActive
                              ? "bg-ocean-100 text-ocean-700 hover:bg-ocean-200"
                              : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700",
                          )}
                        >
                          <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
                          {!collapsed && <span>{item.label}</span>}
                        </Button>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* User section */}
            <div className={cn("border-t border-ocean-200 p-4", collapsed ? "text-center" : "")}>
              {!collapsed && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-ocean-700">{user.name}</p>
                  <p className="text-xs text-ocean-500">{user.role}</p>
                </div>
              )}
              <Button
                variant="ghost"
                className={cn(
                  "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-700",
                  collapsed ? "w-10 h-10 p-0 mx-auto" : "w-full justify-start",
                )}
                onClick={handleLogout}
              >
                <LogOut className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
                {!collapsed && <span>Logout</span>}
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
              isMobile ? "w-full" : collapsed ? "ml-20" : "ml-64",
            )}
          >
            <div className="container py-6 px-4 md:px-6">{children}</div>
          </main>
        </div>
      </div>
    </SettingsProvider>
  )
}
