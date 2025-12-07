"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  LogOut,
  Settings,
  ChevronRight,
  Leaf,
  Menu,
  X,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { dashboardApi, type DashboardStats } from "@/lib/api"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check authentication (demo mode allows bypass)
    const token = localStorage.getItem("silea_token")
    if (!token && !authLoading) {
      router.push("/admin")
      return
    }

    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Demo data
        setStats({
          orders: {
            totalOrders: 156,
            pendingOrders: 12,
            processingOrders: 24,
            shippedOrders: 45,
            deliveredOrders: 75,
          },
          customers: {
            totalCustomers: 89,
            activeCustomers: 67,
            newCustomers: 15,
            vipCustomers: 7,
          },
          products: {
            totalProducts: 24,
            activeProducts: 20,
            inactiveProducts: 2,
            unavailableProducts: 0,
            lowStockProducts: 3,
          },
          tracking: {
            totalTrackings: 234,
            inTransit: 45,
            delivered: 180,
            pending: 9,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [authLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  const statCards = stats
    ? [
        {
          title: "Total Orders",
          value: stats.orders.totalOrders,
          change: "+12.5%",
          trend: "up",
          icon: ShoppingCart,
          color: "#556B2F",
        },
        {
          title: "Total Revenue",
          value: "24,560 MAD",
          change: "+8.2%",
          trend: "up",
          icon: TrendingUp,
          color: "#D6A64F",
        },
        {
          title: "Active Customers",
          value: stats.customers.activeCustomers,
          change: "+5.3%",
          trend: "up",
          icon: Users,
          color: "#556B2F",
        },
        {
          title: "Products",
          value: stats.products.totalProducts,
          // lowStockProducts is optional on the type, coalesce to 0 for calculations
          change: (stats.products.lowStockProducts ?? 0) > 0 ? `${stats.products.lowStockProducts} low stock` : "All good",
          trend: (stats.products.lowStockProducts ?? 0) > 0 ? "down" : "up",
          icon: Package,
          color: "#D6A64F",
        },
      ]
    : []

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-card border-b border-white/20 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#D6A64F] rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#556B2F] text-white text-sm">
                        {user?.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-white/20">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Leaf className="w-4 h-4 mr-2" />
                      View Store
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-6">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))
              : statCards.map((stat, index) => (
                  <Card
                    key={stat.title}
                    className="glass-card opacity-0 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                          <p className="text-3xl font-serif font-bold">{stat.value}</p>
                        </div>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-3">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-[#556B2F]" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-orange-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            stat.trend === "up" ? "text-[#556B2F]" : "text-orange-500"
                          }`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Alerts & Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Alerts */}
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <AlertCircle className="w-5 h-5 text-[#D6A64F]" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(stats?.products.lowStockProducts ?? 0) > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200">
                        <Package className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-orange-800">Low Stock Alert</p>
                          <p className="text-sm text-orange-600">
                            {stats?.products.lowStockProducts} products are running low on stock  
                          </p>
                        </div>
                        <Link href="/admin/products">
                          <Button size="sm" variant="outline" className="border-orange-300">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                    {stats?.orders.pendingOrders && stats.orders.pendingOrders > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <ShoppingCart className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">Pending Orders</p>
                          <p className="text-sm text-blue-600">
                            {stats.orders.pendingOrders} orders waiting to be processed
                          </p>
                        </div>
                        <Link href="/admin/orders">
                          <Button size="sm" variant="outline" className="border-blue-300">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                    {stats?.customers.newCustomers && stats.customers.newCustomers > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#556B2F]/5 border border-[#556B2F]/20">
                        <Users className="w-5 h-5 text-[#556B2F] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-[#556B2F]">New Customers</p>
                          <p className="text-sm text-[#556B2F]/70">
                            {stats.customers.newCustomers} new customers this month
                          </p>
                        </div>
                        <Link href="/admin/customers">
                          <Button size="sm" variant="outline" className="border-[#556B2F]/30">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-serif">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Add New Product", href: "/admin/products", icon: Package },
                  { label: "View All Orders", href: "/admin/orders", icon: ShoppingCart },
                  { label: "Manage Categories", href: "/admin/categories", icon: FolderTree },
                  { label: "Customer List", href: "/admin/customers", icon: Users },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-between hover:bg-[#556B2F]/10"
                    >
                      <span className="flex items-center gap-2">
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Status Overview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-serif">Order Status Overview</CardTitle>
              <CardDescription>Current status of all orders</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Pending", value: stats?.orders.pendingOrders || 0, color: "bg-yellow-500" },
                    { label: "Processing", value: stats?.orders.processingOrders || 0, color: "bg-blue-500" },
                    { label: "Shipped", value: stats?.orders.shippedOrders || 0, color: "bg-purple-500" },
                    { label: "Delivered", value: stats?.orders.deliveredOrders || 0, color: "bg-[#556B2F]" },
                  ].map((status) => (
                    <div
                      key={status.label}
                      className="p-4 rounded-xl bg-muted/50 text-center"
                    >
                      <div className={`w-3 h-3 ${status.color} rounded-full mx-auto mb-2`} />
                      <p className="text-2xl font-serif font-bold">{status.value}</p>
                      <p className="text-sm text-muted-foreground">{status.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

