"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Package,
  Truck,
  Menu,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Ban,
  ChevronLeft,
  Edit,
  Plus,
  Copy,
  Printer,
  ArrowLeft,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ordersApi, trackingApi, type OrderDetailResponse, type TrackingRecord, type OrderStatus, type TrackingStatus } from "@/lib/api"
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

const trackingStatusConfig: Record<TrackingStatus, { label: string; color: string }> = {
  ORDER_PLACED: { label: "Order Placed", color: "bg-gray-500" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-500" },
  PROCESSING: { label: "Processing", color: "bg-indigo-500" },
  PACKED: { label: "Packed", color: "bg-cyan-500" },
  SHIPPED: { label: "Shipped", color: "bg-purple-500" },
  IN_TRANSIT: { label: "In Transit", color: "bg-violet-500" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-orange-500" },
  DELIVERED: { label: "Delivered", color: "bg-[#556B2F]" },
  DELIVERY_ATTEMPTED: { label: "Delivery Attempted", color: "bg-amber-500" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500" },
  RETURNED: { label: "Returned", color: "bg-rose-500" },
}

const allStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"]

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trackingHistory, setTrackingHistory] = useState<TrackingRecord[]>([])
  const [errorType, setErrorType] = useState<"not_found" | "cancelled" | "unavailable" | null>(null)
  
  // Dialogs
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [newTrackingStatus, setNewTrackingStatus] = useState<TrackingStatus>("PROCESSING")
  const [newTrackingLocation, setNewTrackingLocation] = useState("")
  const [newTrackingNotes, setNewTrackingNotes] = useState("")
  const [editAddressOpen, setEditAddressOpen] = useState(false)
  const [editNotesOpen, setEditNotesOpen] = useState(false)
  const [newAddress, setNewAddress] = useState("")
  const [newNotes, setNewNotes] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("silea_token")
    if (!token) {
      router.push("/admin")
      return
    }
    fetchOrderDetails()
  }, [id, router])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setErrorType(null)
      const data = await ordersApi.getDetails(parseInt(id))
      setOrder(data)
      setNewStatus(data.status)
      setNewAddress(data.shippingAddress)
      setNewNotes(data.notes || "")
      
      // Fetch tracking history
      try {
        const tracking = await trackingApi.getByOrderId(parseInt(id))
        setTrackingHistory(tracking)
      } catch (trackingError) {
        // Tracking history might fail, but that's okay
        console.warn("Failed to fetch tracking history:", trackingError)
      }
    } catch (error: any) {
      console.error("Failed to fetch order details:", error)
      
      // Check if it's a 404 error
      if (error?.status === 404 || error?.name === "ApiError") {
        // Try to check if the order exists in the list (might be cancelled)
        try {
          const allOrders = await ordersApi.getAll(0, 1000)
          const foundOrder = allOrders.find((o) => o.id === parseInt(id))
          
          if (foundOrder) {
            if (foundOrder.status === "CANCELLED") {
              setErrorType("cancelled")
            } else {
              setErrorType("unavailable")
            }
          } else {
            setErrorType("not_found")
          }
        } catch (listError) {
          // If we can't fetch the list, assume it's unavailable
          setErrorType("unavailable")
        }
      } else {
        setErrorType("unavailable")
      }
      
      // Don't show toast for 404 errors, we'll show a nice UI instead
      if (error?.status !== 404) {
        toast.error("Failed to load order details")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!order) return
    try {
      await ordersApi.updateStatus(order.id, newStatus)
      setOrder({ ...order, status: newStatus })
      toast.success(`Status updated to ${statusConfig[newStatus].label}`)
      setStatusDialogOpen(false)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleConfirmOrder = async () => {
    if (!order) return
    try {
      await ordersApi.confirmOrder(order.id)
      setOrder({ ...order, status: "CONFIRMED" })
      toast.success("Order confirmed successfully")
    } catch (error) {
      toast.error("Failed to confirm order")
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    try {
      await ordersApi.cancelOrderAdmin(order.id, cancelReason)
      setOrder({ ...order, status: "CANCELLED" })
      toast.success("Order cancelled successfully")
      setCancelDialogOpen(false)
      setCancelReason("")
    } catch (error) {
      toast.error("Failed to cancel order")
    }
  }

  const handleUpdateAddress = async () => {
    if (!order) return
    try {
      await ordersApi.updateAddress(order.id, newAddress)
      setOrder({ ...order, shippingAddress: newAddress })
      toast.success("Address updated successfully")
      setEditAddressOpen(false)
    } catch (error) {
      toast.error("Failed to update address")
    }
  }

  const handleUpdateNotes = async () => {
    if (!order) return
    try {
      await ordersApi.updateNotes(order.id, newNotes)
      setOrder({ ...order, notes: newNotes })
      toast.success("Notes updated successfully")
      setEditNotesOpen(false)
    } catch (error) {
      toast.error("Failed to update notes")
    }
  }

  const handleAddTracking = async () => {
    if (!order) return
    try {
      const result = await trackingApi.addUpdate({
        orderId: order.id,
        status: newTrackingStatus,
        location: newTrackingLocation,
        notes: newTrackingNotes,
      })
      setTrackingHistory([result.tracking, ...trackingHistory])
      toast.success("Tracking update added")
      setTrackingDialogOpen(false)
      setNewTrackingLocation("")
      setNewTrackingNotes("")
    } catch (error) {
      toast.error("Failed to add tracking update")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: OrderStatus) => {
    const config = statusConfig[status] || statusConfig.PENDING
    const StatusIcon = config.icon
    return (
      <Badge className={`${config.bgColor} text-white gap-1.5 px-3 py-1.5 text-sm`}>
        <StatusIcon className="w-4 h-4" />
        {config.label}
      </Badge>
    )
  }

  const isCancellable = (status: OrderStatus) => {
    return status === "PENDING" || status === "CONFIRMED" || status === "PROCESSING"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#FAF7F0]">
        <div className="flex-1 lg:ml-64 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    // Show different messages based on error type
    let title = "Order Unavailable"
    let message = "This order is currently unavailable or may have been removed."
    let icon = Package
    let iconColor = "text-[#556B2F]/30"
    
    if (errorType === "cancelled") {
      title = "Order Cancelled"
      message = "This order has been cancelled and is no longer accessible."
      icon = XCircle
      iconColor = "text-red-500/30"
    } else if (errorType === "not_found") {
      title = "Order Not Found"
      message = "The order you're looking for doesn't exist in our system."
      icon = Package
      iconColor = "text-[#556B2F]/30"
    }
    
    const IconComponent = icon
    
    return (
      <div className="min-h-screen flex bg-[#FAF7F0] items-center justify-center p-4">
        <Card className="bg-white border-[#556B2F]/10 p-8 text-center max-w-md w-full shadow-lg">
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full bg-[#FAF7F0] flex items-center justify-center mb-6 ${errorType === "cancelled" ? "bg-red-50" : ""}`}>
              <IconComponent className={`w-10 h-10 ${iconColor}`} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#556B2F] mb-3">{title}</h2>
            <p className="text-[#556B2F]/60 mb-6 leading-relaxed">{message}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/admin/orders">
                <Button className="bg-[#556B2F] hover:bg-[#556B2F]/90">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={fetchOrderDetails}
                className="border-[#556B2F]/20 text-[#556B2F]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#FAF7F0]">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#556B2F]/10 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="text-[#556B2F]">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Orders
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="border-[#556B2F]/20 text-[#556B2F]">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Order Header */}
            <Card className="bg-white border-[#556B2F]/10 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F]" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="font-serif text-3xl font-bold text-[#556B2F]">{order.orderNumber}</h1>
                      <button onClick={() => copyToClipboard(order.orderNumber)} className="p-1.5 rounded-lg hover:bg-[#556B2F]/5">
                        <Copy className="w-4 h-4 text-[#556B2F]/40" />
                      </button>
                    </div>
                    {order.trackingCode && (
                      <p className="text-sm text-[#556B2F]/60 font-mono flex items-center gap-2">
                        Tracking: {order.trackingCode}
                        <button onClick={() => copyToClipboard(order.trackingCode!)} className="p-1 rounded hover:bg-[#556B2F]/5">
                          <Copy className="w-3 h-3 text-[#556B2F]/40" />
                        </button>
                      </p>
                    )}
                    <p className="text-sm text-[#556B2F]/50 mt-1">
                      Created on {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setStatusDialogOpen(true)}
                      className="border-[#556B2F]/20 text-[#556B2F]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Change
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[#556B2F]/10">
                  {order.status === "PENDING" && (
                    <Button size="sm" onClick={handleConfirmOrder} className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Confirm Order
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setTrackingDialogOpen(true)} className="border-[#556B2F]/20 text-[#556B2F]">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Tracking
                  </Button>
                  {isCancellable(order.status) && (
                    <Button size="sm" variant="outline" onClick={() => setCancelDialogOpen(true)} className="border-red-200 text-red-600 hover:bg-red-50">
                      <Ban className="w-4 h-4 mr-1" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <Card className="bg-white border-[#556B2F]/10">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif text-lg text-[#556B2F] flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#FAF7F0]">
                    <p className="font-semibold text-[#556B2F] text-lg">{order.customer.name}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#556B2F]/70">
                        <Mail className="w-4 h-4" />
                        {order.customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#556B2F]/70">
                        <Phone className="w-4 h-4" />
                        {order.customer.phone}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="bg-white border-[#556B2F]/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg text-[#556B2F] flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Shipping Address
                    </CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setEditAddressOpen(true)} className="text-[#556B2F]">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-[#FAF7F0]">
                    <p className="text-[#556B2F] whitespace-pre-wrap">{order.shippingAddress}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card className="bg-white border-[#556B2F]/10">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg text-[#556B2F] flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({order.itemCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F0] border border-[#556B2F]/5">
                      <div>
                        <p className="font-medium text-[#556B2F]">{item.productName}</p>
                        <p className="text-sm text-[#556B2F]/60">
                          {item.size} × {item.quantity} @ {item.unitPrice.toFixed(2)} MAD
                        </p>
                      </div>
                      <p className="font-serif font-bold text-[#D6A64F] text-lg">{item.totalPrice.toFixed(2)} MAD</p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4 bg-[#556B2F]/10" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#556B2F]">Total</span>
                  <span className="text-2xl font-serif font-bold text-[#D6A64F]">{order.total.toFixed(2)} MAD</span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-white border-[#556B2F]/10">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-lg text-[#556B2F] flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setEditNotesOpen(true)} className="text-[#556B2F]">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-[#FAF7F0]">
                  <p className="text-[#556B2F] whitespace-pre-wrap">{order.notes || "No notes"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-[#556B2F]/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#556B2F]/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#556B2F]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#556B2F]/60">Order Date</p>
                      <p className="font-semibold text-[#556B2F]">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#556B2F]/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#D6A64F]/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-[#D6A64F]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#556B2F]/60">Est. Delivery</p>
                      <p className="font-semibold text-[#556B2F]">{formatDate(order.estimatedDeliveryDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tracking History */}
            <Card className="bg-white border-[#556B2F]/10">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg text-[#556B2F] flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trackingHistory.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-[#FAF7F0]">
                    <Package className="w-10 h-10 text-[#556B2F]/30 mx-auto mb-3" />
                    <p className="text-[#556B2F]/60">No tracking updates yet</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-[#556B2F]/20" />
                    {trackingHistory.map((record, index) => {
                      const config = trackingStatusConfig[record.status] || trackingStatusConfig.PROCESSING
                      return (
                        <div key={record.id} className="relative flex gap-4">
                          <div className={`absolute -left-4 w-4 h-4 rounded-full ${config.color} ring-4 ring-white flex-shrink-0 mt-1`} />
                          <div className="flex-1 p-4 rounded-xl bg-[#FAF7F0]">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="text-xs bg-white">{config.label}</Badge>
                              <span className="text-xs text-[#556B2F]/40">{formatDate(record.statusDate)}</span>
                            </div>
                            {record.location && (
                              <p className="text-sm text-[#556B2F]/70 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {record.location}
                              </p>
                            )}
                            {record.notes && (
                              <p className="text-sm text-[#556B2F]/60 mt-1">{record.notes}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Change Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-[#FAF7F0] border-[#556B2F]/10">
          <DialogHeader>
            <DialogTitle className="text-[#556B2F] font-serif">Change Order Status</DialogTitle>
            <DialogDescription className="text-[#556B2F]/60">
              Update the status of order {order.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#556B2F]">New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger className="mt-2 border-[#556B2F]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="border-[#556B2F]/20 text-[#556B2F]">Cancel</Button>
            <Button onClick={handleStatusChange} className="bg-[#556B2F] hover:bg-[#556B2F]/90">Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-[#FAF7F0] border-[#556B2F]/10">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Cancel Order
            </DialogTitle>
            <DialogDescription className="text-[#556B2F]/60">
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-[#556B2F]">Cancellation Reason (Optional)</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason..."
              className="mt-2 border-[#556B2F]/20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="border-[#556B2F]/20 text-[#556B2F]">Keep Order</Button>
            <Button variant="destructive" onClick={handleCancelOrder}>Cancel Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="bg-[#FAF7F0] border-[#556B2F]/10">
          <DialogHeader>
            <DialogTitle className="text-[#556B2F] font-serif">Add Tracking Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#556B2F]">Status</Label>
              <Select value={newTrackingStatus} onValueChange={(v) => setNewTrackingStatus(v as TrackingStatus)}>
                <SelectTrigger className="mt-2 border-[#556B2F]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(trackingStatusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#556B2F]">Location</Label>
              <Input
                value={newTrackingLocation}
                onChange={(e) => setNewTrackingLocation(e.target.value)}
                placeholder="e.g., Distribution Center - Casablanca"
                className="mt-2 border-[#556B2F]/20"
              />
            </div>
            <div>
              <Label className="text-[#556B2F]">Notes</Label>
              <Textarea
                value={newTrackingNotes}
                onChange={(e) => setNewTrackingNotes(e.target.value)}
                placeholder="Additional details..."
                className="mt-2 border-[#556B2F]/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)} className="border-[#556B2F]/20 text-[#556B2F]">Cancel</Button>
            <Button onClick={handleAddTracking} className="bg-[#556B2F] hover:bg-[#556B2F]/90">Add Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={editAddressOpen} onOpenChange={setEditAddressOpen}>
        <DialogContent className="bg-[#FAF7F0] border-[#556B2F]/10">
          <DialogHeader>
            <DialogTitle className="text-[#556B2F] font-serif">Edit Shipping Address</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-[#556B2F]">Shipping Address</Label>
            <Textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="mt-2 min-h-[100px] border-[#556B2F]/20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAddressOpen(false)} className="border-[#556B2F]/20 text-[#556B2F]">Cancel</Button>
            <Button onClick={handleUpdateAddress} className="bg-[#556B2F] hover:bg-[#556B2F]/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notes Dialog */}
      <Dialog open={editNotesOpen} onOpenChange={setEditNotesOpen}>
        <DialogContent className="bg-[#FAF7F0] border-[#556B2F]/10">
          <DialogHeader>
            <DialogTitle className="text-[#556B2F] font-serif">Edit Order Notes</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-[#556B2F]">Notes</Label>
            <Textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="mt-2 min-h-[100px] border-[#556B2F]/20"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNotesOpen(false)} className="border-[#556B2F]/20 text-[#556B2F]">Cancel</Button>
            <Button onClick={handleUpdateNotes} className="bg-[#556B2F] hover:bg-[#556B2F]/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

