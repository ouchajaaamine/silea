"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Package,
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  Menu,
  Clock,
  CheckCircle2,
  Filter,
  XCircle,
  RefreshCw,
  Calendar,
  Ban,
  Edit,
  Download,
  CalendarDays,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ordersApi, type Order, type OrderStatistics, type OrderStatus } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { toast } from "sonner"

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: "Pending", color: "text-amber-600", bgColor: "bg-amber-500", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "text-blue-600", bgColor: "bg-blue-500", icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "text-indigo-600", bgColor: "bg-indigo-500", icon: Package },
  SHIPPED: { label: "Shipped", color: "text-purple-600", bgColor: "bg-purple-500", icon: Truck },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-600", bgColor: "bg-orange-500", icon: Truck },
  DELIVERED: { label: "Delivered", color: "text-[#556B2F]", bgColor: "bg-[#556B2F]", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-500", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "text-gray-600", bgColor: "bg-gray-500", icon: RefreshCw },
}

const datePresets = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Custom Range", value: "custom" },
]

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<OrderStatistics | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("silea_token")
    if (!token) {
      router.push("/admin")
      return
    }
    fetchOrders()
    fetchStats()
  }, [router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersApi.getAll(0, 100)
      setOrders(data)
    } catch (error: any) {
      console.error("Failed to fetch orders:", error)
      if (error?.status === 403) {
        toast.error("Session expired. Please log in again.")
        router.push("/admin")
      } else {
        toast.error("Failed to load orders")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await ordersApi.getStats()
      setStats(data)
    } catch (error: any) {
      console.error("Failed to fetch stats:", error)
      // Don't show error toast for stats, just log it
      // 403 errors will be handled by the redirect in handleResponse
      if (error?.status === 403) {
        // Already handled by handleResponse redirect
        return
      }
    }
  }

  const getDateRange = (preset: string): { start: Date | null; end: Date | null } => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (preset) {
      case "today":
        return { start: today, end: now }
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return { start: yesterday, end: today }
      case "7days":
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return { start: sevenDaysAgo, end: now }
      case "30days":
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return { start: thirtyDaysAgo, end: now }
      case "thisMonth":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return { start: startOfMonth, end: now }
      case "lastMonth":
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        return { start: startOfLastMonth, end: endOfLastMonth }
      case "custom":
        return {
          start: customStartDate ? new Date(customStartDate) : null,
          end: customEndDate ? new Date(customEndDate) : null,
        }
      default:
        return { start: null, end: null }
    }
  }

  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingCode && order.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Status filter
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    // Date filter
    let matchesDate = true
    if (dateFilter !== "all") {
      const { start, end } = getDateRange(dateFilter)
      if (start && end && order.orderDate) {
        const orderDate = new Date(order.orderDate)
        matchesDate = orderDate >= start && orderDate <= end
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      toast.success(`Order status updated to ${statusConfig[newStatus].label}`)
      fetchStats()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleConfirmOrder = async (orderId: number) => {
    try {
      await ordersApi.confirmOrder(orderId)
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" as OrderStatus } : o)))
      toast.success("Order confirmed successfully")
      fetchStats()
    } catch (error) {
      toast.error("Failed to confirm order")
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    try {
      await ordersApi.cancelOrderAdmin(orderId)
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" as OrderStatus } : o)))
      toast.success("Order cancelled successfully")
      fetchStats()
    } catch (error) {
      toast.error("Failed to cancel order")
    }
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Order Number", "Tracking Code", "Customer", "Email", "Date", "Items", "Total", "Status"]
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.trackingCode || "",
      order.customer.name,
      order.customer.email || "",
      new Date(order.orderDate).toLocaleDateString(),
      order.itemCount || order.orderItems?.length || 0,
      order.total.toFixed(2),
      order.status,
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `orders-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${filteredOrders.length} orders to CSV`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: OrderStatus) => {
    const config = statusConfig[status] || statusConfig.PENDING
    const StatusIcon = config.icon
    return (
      <Badge className={`${config.bgColor} text-white gap-1.5 px-2.5 py-1`}>
        <StatusIcon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    )
  }

  const isCancellable = (status: OrderStatus) => {
    return status === "PENDING" || status === "CONFIRMED" || status === "PROCESSING"
  }

  return (
    <div className="min-h-screen flex bg-[#FAF7F0]">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#556B2F]/10 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden text-[#556B2F]" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#556B2F]">Orders</h1>
                <p className="text-sm text-[#556B2F]/60">Manage and track customer orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 border-[#556B2F]/20 text-[#556B2F]">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2 border-[#556B2F]/20 text-[#556B2F]">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-white border-[#556B2F]/10 cursor-pointer hover:shadow-lg transition-all" onClick={() => setStatusFilter("all")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#556B2F]/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#556B2F]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#556B2F]">{stats.totalOrders}</p>
                      <p className="text-xs text-[#556B2F]/60">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-amber-200/50 cursor-pointer hover:shadow-lg transition-all" onClick={() => setStatusFilter("PENDING")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                      <p className="text-xs text-[#556B2F]/60">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-indigo-200/50 cursor-pointer hover:shadow-lg transition-all" onClick={() => setStatusFilter("PROCESSING")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{stats.processingOrders}</p>
                      <p className="text-xs text-[#556B2F]/60">Processing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-purple-200/50 cursor-pointer hover:shadow-lg transition-all" onClick={() => setStatusFilter("SHIPPED")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{stats.shippedOrders}</p>
                      <p className="text-xs text-[#556B2F]/60">Shipped</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#556B2F]/20 cursor-pointer hover:shadow-lg transition-all" onClick={() => setStatusFilter("DELIVERED")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#556B2F]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[#556B2F]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#556B2F]">{stats.deliveredOrders}</p>
                      <p className="text-xs text-[#556B2F]/60">Delivered</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-red-200/50 cursor-pointer hover:shadow-lg transition-all" onClick={() => setStatusFilter("CANCELLED")}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</p>
                      <p className="text-xs text-[#556B2F]/60">Cancelled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue & Performance */}
          {stats && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Monthly Revenue</p>
                      <p className="text-3xl font-bold font-serif">{stats.monthlyRevenue?.toFixed(2) || "0.00"} MAD</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#D6A64F] to-[#E8B960] text-white border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Today's Orders</p>
                      <p className="text-3xl font-bold">{stats.todaysOrders}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Completion Rate</p>
                      <p className="text-3xl font-bold">{stats.completionRate?.toFixed(1) || "0"}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="bg-white border-[#556B2F]/10">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#556B2F]/40" />
                  <Input
                    placeholder="Search by order number, customer, or tracking code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-[#556B2F]/20 focus:border-[#556B2F]"
                  />
                </div>
                
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[180px] border-[#556B2F]/20">
                    <Filter className="w-4 h-4 mr-2 text-[#556B2F]/40" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full lg:w-[180px] justify-start border-[#556B2F]/20 text-[#556B2F]">
                      <Calendar className="w-4 h-4 mr-2" />
                      {datePresets.find((p) => p.value === dateFilter)?.label || "All Time"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="end">
                    <div className="space-y-2">
                      {datePresets.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={dateFilter === preset.value ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start ${
                            dateFilter === preset.value 
                              ? "bg-[#556B2F] text-white" 
                              : "text-[#556B2F] hover:bg-[#556B2F]/5"
                          }`}
                          onClick={() => setDateFilter(preset.value)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                      
                      {dateFilter === "custom" && (
                        <div className="pt-2 space-y-2 border-t border-[#556B2F]/10">
                          <div>
                            <Label className="text-xs text-[#556B2F]/60">Start Date</Label>
                            <Input
                              type="date"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="mt-1 border-[#556B2F]/20"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[#556B2F]/60">End Date</Label>
                            <Input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="mt-1 border-[#556B2F]/20"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Active Filters */}
              {(statusFilter !== "all" || dateFilter !== "all" || searchQuery) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#556B2F]/10">
                  <span className="text-xs text-[#556B2F]/60">Active filters:</span>
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="bg-[#556B2F]/10 text-[#556B2F]">
                      Status: {statusConfig[statusFilter as OrderStatus]?.label}
                      <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  {dateFilter !== "all" && (
                    <Badge variant="secondary" className="bg-[#556B2F]/10 text-[#556B2F]">
                      Date: {datePresets.find((p) => p.value === dateFilter)?.label}
                      <button onClick={() => setDateFilter("all")} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-[#556B2F]/10 text-[#556B2F]">
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setStatusFilter("all"); setDateFilter("all"); setSearchQuery(""); }}
                    className="text-xs text-[#556B2F]/60 hover:text-[#556B2F]"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#556B2F]/60">
              Showing <span className="font-semibold text-[#556B2F]">{filteredOrders.length}</span> of{" "}
              <span className="font-semibold text-[#556B2F]">{orders.length}</span> orders
            </p>
          </div>

          {/* Orders Table */}
          <Card className="bg-white border-[#556B2F]/10 overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-[#556B2F]/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#556B2F] mb-1">No orders found</h3>
                  <p className="text-[#556B2F]/60">Try adjusting your search or filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FAF7F0]/50 hover:bg-[#FAF7F0]/50">
                      <TableHead className="font-semibold text-[#556B2F]">Order</TableHead>
                      <TableHead className="font-semibold text-[#556B2F]">Customer</TableHead>
                      <TableHead className="font-semibold text-[#556B2F]">Date</TableHead>
                      <TableHead className="font-semibold text-[#556B2F]">Items</TableHead>
                      <TableHead className="font-semibold text-[#556B2F]">Total</TableHead>
                      <TableHead className="font-semibold text-[#556B2F]">Status</TableHead>
                      <TableHead className="text-right font-semibold text-[#556B2F]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow 
                        key={order.id} 
                        className="hover:bg-[#FAF7F0]/50 cursor-pointer" 
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-mono font-semibold text-[#556B2F]">{order.orderNumber}</p>
                            {order.trackingCode && (
                              <p className="text-xs text-[#556B2F]/40 font-mono">{order.trackingCode}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#556B2F]">{order.customer.name}</p>
                            <p className="text-xs text-[#556B2F]/40">{order.customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#556B2F]/80">{formatDate(order.orderDate)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-[#556B2F]/10 text-[#556B2F]">
                            {order.itemCount || order.orderItems?.length || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-[#D6A64F]">{order.total.toFixed(2)} MAD</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#556B2F]">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border-[#556B2F]/10">
                              <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status === "PENDING" && (
                                <DropdownMenuItem onClick={() => handleConfirmOrder(order.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                                  Confirm Order
                                </DropdownMenuItem>
                              )}
                              {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "PROCESSING")}>
                                  <Edit className="w-4 h-4 mr-2 text-indigo-600" />
                                  Start Processing
                                </DropdownMenuItem>
                              )}
                              {order.status === "PROCESSING" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "SHIPPED")}>
                                  <Truck className="w-4 h-4 mr-2 text-purple-600" />
                                  Mark Shipped
                                </DropdownMenuItem>
                              )}
                              {order.status === "SHIPPED" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "OUT_FOR_DELIVERY")}>
                                  <Truck className="w-4 h-4 mr-2 text-orange-600" />
                                  Out for Delivery
                                </DropdownMenuItem>
                              )}
                              {(order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY") && (
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, "DELIVERED")}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-[#556B2F]" />
                                  Mark Delivered
                                </DropdownMenuItem>
                              )}
                              {isCancellable(order.status) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleCancelOrder(order.id)}
                                  >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
