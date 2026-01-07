"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, Users, Package, FolderTree, Clock, Menu } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { dashboardApi, ordersApi } from "@/lib/api"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("silea_token")
    if (!token && !authLoading) {
      router.push("/admin")
      return
    }

    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          dashboardApi.getStats(),
          ordersApi.getAll()
        ])
        setStats(statsData)
        setRecentOrders(ordersData.slice(0, 5))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#556B2F] border-t-transparent rounded-full" />
      </div>
    )
  }

  const statsCards = [
    {
      title: "Total Orders",
      value: stats?.orders?.totalOrders || 0,
      icon: ShoppingCart,
      color: "from-[#556B2F] to-[#6B8E3C]",
      link: "/admin/orders"
    },
    {
      title: "Pending",
      value: stats?.orders?.pendingOrders || 0,
      icon: Clock,
      color: "from-[#D6A64F] to-[#C89640]",
      link: "/admin/orders"
    },
    {
      title: "Customers",
      value: stats?.customers?.totalCustomers || 0,
      icon: Users,
      color: "from-[#10B981] to-[#059669]",
      link: "/admin/customers"
    },
    {
      title: "Products",
      value: stats?.products?.totalProducts || 0,
      icon: Package,
      color: "from-[#8B5CF6] to-[#7C3AED]",
      link: "/admin/products"
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 lg:ml-64">
        <header className="glass-card border-b px-4 lg:px-8 py-4">
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
              <p className="text-sm text-muted-foreground">Overview of your business</p>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => (
              <Link key={stat.title} href={stat.link}>
                <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif">Recent Orders</CardTitle>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer?.name || 'Unknown Customer'}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-bold">{order.total} MAD</p>
                        <p className="text-xs text-muted-foreground">
                          {order.orderItems?.length || 0} items
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/products">
              <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#556B2F]/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#556B2F]" />
                  </div>
                  <div>
                    <p className="font-semibold">Manage Products</p>
                    <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/categories">
              <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D6A64F]/10 flex items-center justify-center">
                    <FolderTree className="w-6 h-6 text-[#D6A64F]" />
                  </div>
                  <div>
                    <p className="font-semibold">Manage Categories</p>
                    <p className="text-sm text-muted-foreground">Organize your product categories</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}

