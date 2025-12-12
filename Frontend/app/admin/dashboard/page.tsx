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
  Truck,
  Clock,
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
import { dashboardApi, type DashboardStats, type RecentOrder, type DeliveryPerformance, type DashboardAlerts } from "@/lib/api"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [deliveryPerformance, setDeliveryPerformance] = useState<DeliveryPerformance | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check authentication (demo mode allows bypass)
    const token = localStorage.getItem("silea_token")
    if (!token && !authLoading) {
      router.push("/admin")
      return
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch all dashboard data in parallel
        const [statsData, ordersData, performanceData, alertsData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentOrders(10),
          dashboardApi.getDeliveryPerformance(),
          dashboardApi.getAlerts(),
        ])

        setStats(statsData)
        setRecentOrders(ordersData.orders)
        setDeliveryPerformance(performanceData)
        setAlerts(alertsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        // Set demo data on error for development
        setStats({
          orders: {
            totalOrders: 156,
            pendingOrders: 12,
            completedOrders: 135,
            cancelledOrders: 9,
          },
          customers: {
            totalCustomers: 89,
            activeCustomers: 67,
            inactiveCustomers: 22,
          },
          products: {
            totalProducts: 24,
            activeProducts: 20,
            inactiveProducts: 2,
            unavailableProducts: 2,
          },
          tracking: {
            totalTrackings: 234,
            inTransit: 45,
            delivered: 180,
            pending: 9,
          },
        })
        setDeliveryPerformance({
          averageDeliveryTime: 28.5,
          delayedOrdersCount: 3,
        })
        setAlerts({
          unavailableProductsCount: 2,
          pendingOrdersCount: 12,
          delayedDeliveriesCount: 3,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
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
          change: `${stats.orders.pendingOrders} pending`,
          trend: stats.orders.pendingOrders > 0 ? "down" : "up",
          icon: ShoppingCart,
          color: "#556B2F",
        },
        {
          title: "Completed Orders",
          value: stats.orders.completedOrders,
          change: `${stats.orders.cancelledOrders} cancelled`,
          trend: "up",
          icon: TrendingUp,
          color: "#D6A64F",
        },
        {
          title: "Active Customers",
          value: stats.customers.activeCustomers,
          change: `${stats.customers.totalCustomers} total`,
          trend: "up",
          icon: Users,
          color: "#556B2F",
        },
        {
          title: "Products",
          value: stats.products.totalProducts,
          change: stats.products.unavailableProducts > 0 ? `${stats.products.unavailableProducts} unavailable` : "All available",
          trend: stats.products.unavailableProducts > 0 ? "down" : "up",
          icon: Package,
          color: "#D6A64F",
        },
      ]
    : []

  // Small sparkline renderer for cards (returns SVG element)
  const renderSparkline = (values: number[], color = '#D6A64F') => {
    if (!values || values.length === 0) return null
    const w = 120
    const h = 32
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = Math.max(1, max - min)
    const points = values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return `${x},${y}`
      })
      .join(' ')

    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      </svg>
    )
  }

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
          {/* Hero KPI + Polished Stat Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main revenue/summary hero */}
              <Card className="glass-card lg:col-span-2 p-6 overflow-hidden relative">
                <div className="absolute -right-32 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#D6A64F] to-[#556B2F] opacity-10 transform rotate-45" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overview</p>
                      <h2 className="text-4xl font-serif font-bold">Business Summary</h2>
                      <p className="mt-2 text-sm text-muted-foreground">Key metrics at a glance</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">This month</p>
                      <p className="text-3xl font-bold">{stats?.orders.totalOrders || 0} orders</p>
                      <p className="text-sm text-muted-foreground">Revenue: <span className="font-semibold">24,560 MAD</span></p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-muted-foreground">Avg Delivery Time</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-2xl font-bold">{deliveryPerformance?.averageDeliveryTime?.toFixed(1) ?? '—'}h</div>
                        {renderSparkline([10, 12, 18, 15, 20, deliveryPerformance?.averageDeliveryTime ?? 18], '#556B2F')}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-xs text-muted-foreground">Delayed Orders</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-2xl font-bold">{deliveryPerformance?.delayedOrdersCount ?? 0}</div>
                        {renderSparkline([2, 3, 1, 5, 4, deliveryPerformance?.delayedOrdersCount ?? 0], '#F97316')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Small KPI cards */}
              <div className="grid grid-cols-1 gap-4">
                {loading
                  ? Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i} className="glass-card p-4">
                          <CardContent className="p-4">
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-8 w-24" />
                          </CardContent>
                        </Card>
                      ))
                  : [
                      {
                        title: 'Active Customers',
                        value: stats?.customers.activeCustomers || 0,
                        colorFrom: '#10B981',
                        colorTo: '#059669',
                        spark: [5, 6, 8, 9, stats?.customers.activeCustomers ?? 0],
                        icon: Users,
                      },
                      {
                        title: 'Products',
                        value: stats?.products.totalProducts || 0,
                        colorFrom: '#D6A64F',
                        colorTo: '#B8860B',
                        spark: [12, 11, 14, 13, stats?.products.totalProducts ?? 0],
                        icon: Package,
                      },
                    ].map((card) => (
                      <div key={card.title} className="rounded-lg overflow-hidden shadow-lg">
                        <div className="p-4" style={{ background: `linear-gradient(135deg, ${card.colorFrom}, ${card.colorTo})` }}>
                          <div className="flex items-center justify-between text-white">
                            <div>
                              <p className="text-xs opacity-90">{card.title}</p>
                              <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                            <div className="opacity-90">
                              <card.icon className="w-8 h-8" />
                            </div>
                          </div>
                          <div className="mt-3">{renderSparkline(card.spark, '#ffffff')}</div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
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
                    {alerts && alerts.unavailableProductsCount > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200">
                        <Package className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-orange-800">Unavailable Products</p>
                          <p className="text-sm text-orange-600">
                            {alerts.unavailableProductsCount} products are unavailable
                          </p>
                        </div>
                        <Link href="/admin/products">
                          <Button size="sm" variant="outline" className="border-orange-300">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                    {alerts && alerts.pendingOrdersCount > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <ShoppingCart className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">Pending Orders</p>
                          <p className="text-sm text-blue-600">
                            {alerts.pendingOrdersCount} orders waiting to be processed
                          </p>
                        </div>
                        <Link href="/admin/orders">
                          <Button size="sm" variant="outline" className="border-blue-300">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                    {alerts && alerts.delayedDeliveriesCount > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                        <Truck className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-800">Delayed Deliveries</p>
                          <p className="text-sm text-red-600">
                            {alerts.delayedDeliveriesCount} orders have delayed tracking
                          </p>
                        </div>
                        <Link href="/admin/orders">
                          <Button size="sm" variant="outline" className="border-red-300">
                            View
                          </Button>
                        </Link>
                      </div>
                    )}
                    {(!alerts || (alerts.unavailableProductsCount === 0 && alerts.pendingOrdersCount === 0 && alerts.delayedDeliveriesCount === 0)) && (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <p>No alerts at the moment</p>
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
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-serif">Order Status Overview</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Pending", value: stats?.orders.pendingOrders || 0, color: "bg-yellow-500" },
                      { label: "Completed", value: stats?.orders.completedOrders || 0, color: "bg-[#556B2F]" },
                      { label: "Cancelled", value: stats?.orders.cancelledOrders || 0, color: "bg-red-500" },
                      { label: "Total", value: stats?.orders.totalOrders || 0, color: "bg-blue-500" },
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

            {/* Delivery Performance */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-serif">Delivery Performance</CardTitle>
                <CardDescription>Tracking metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#556B2F]/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#556B2F]/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#556B2F]" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
                          <p className="text-2xl font-bold">{deliveryPerformance?.averageDeliveryTime?.toFixed(1) || '0'}h</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Delayed Orders</p>
                          <p className="text-2xl font-bold">{deliveryPerformance?.delayedOrdersCount || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">In Transit</p>
                        <p className="text-lg font-bold">{stats?.tracking.inTransit || 0}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Delivered</p>
                        <p className="text-lg font-bold">{stats?.tracking.delivered || 0}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-bold">{stats?.tracking.pending || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif">Recent Orders</CardTitle>
                  <CardDescription>Latest orders from customers</CardDescription>
                </div>
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#556B2F]/10 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-[#556B2F]" />
                        </div>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{order.total.toFixed(2)} MAD</p>
                          <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
                        </div>
                        <Badge
                          variant={
                            order.status === "COMPLETED"
                              ? "default"
                              : order.status === "PENDING"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>No recent orders</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

