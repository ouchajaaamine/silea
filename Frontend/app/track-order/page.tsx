"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { 
  Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, 
  Phone, Mail, ShoppingBag, Calendar, Copy, Check, XCircle, 
  AlertCircle, RefreshCw, Ban, PackageCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ordersApi, trackingApi, type OrderDetailResponse, type TrackingRecord, type OrderStatus, type TrackingStatus } from "@/lib/api"
import { toast } from "sonner"

const statusConfig: Record<OrderStatus, { label: string; labelAr: string; color: string; bgColor: string; icon: any; description: string }> = {
  PENDING: { 
    label: "Pending", 
    labelAr: "قيد الانتظار", 
    color: "text-amber-600", 
    bgColor: "bg-amber-500", 
    icon: Clock,
    description: "Your order has been received and is awaiting confirmation"
  },
  CONFIRMED: { 
    label: "Confirmed", 
    labelAr: "تم التأكيد", 
    color: "text-blue-600", 
    bgColor: "bg-blue-500", 
    icon: CheckCircle2,
    description: "Your order has been confirmed and is being prepared"
  },
  PROCESSING: { 
    label: "Processing", 
    labelAr: "قيد المعالجة", 
    color: "text-indigo-600", 
    bgColor: "bg-indigo-500", 
    icon: Package,
    description: "Your order is being carefully packed"
  },
  SHIPPED: { 
    label: "Shipped", 
    labelAr: "تم الشحن", 
    color: "text-purple-600", 
    bgColor: "bg-purple-500", 
    icon: Truck,
    description: "Your order is on its way to you"
  },
  OUT_FOR_DELIVERY: { 
    label: "Out for Delivery", 
    labelAr: "خارج للتوصيل", 
    color: "text-orange-600", 
    bgColor: "bg-orange-500", 
    icon: Truck,
    description: "Your order is out for delivery today"
  },
  DELIVERED: { 
    label: "Delivered", 
    labelAr: "تم التسليم", 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-500", 
    icon: CheckCircle2,
    description: "Your order has been delivered successfully"
  },
  CANCELLED: { 
    label: "Cancelled", 
    labelAr: "ملغى", 
    color: "text-red-600", 
    bgColor: "bg-red-500", 
    icon: XCircle,
    description: "This order has been cancelled"
  },
  REFUNDED: { 
    label: "Refunded", 
    labelAr: "مسترد", 
    color: "text-gray-600", 
    bgColor: "bg-gray-500", 
    icon: RefreshCw,
    description: "This order has been refunded"
  },
}

const trackingStatusConfig: Record<TrackingStatus, { label: string; color: string }> = {
  ORDER_PLACED: { label: "Order Placed", color: "bg-gray-500" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-500" },
  PROCESSING: { label: "Processing", color: "bg-indigo-500" },
  PACKED: { label: "Packed", color: "bg-cyan-500" },
  SHIPPED: { label: "Shipped", color: "bg-purple-500" },
  IN_TRANSIT: { label: "In Transit", color: "bg-violet-500" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-orange-500" },
  DELIVERED: { label: "Delivered", color: "bg-emerald-500" },
  DELIVERY_ATTEMPTED: { label: "Delivery Attempted", color: "bg-amber-500" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500" },
  RETURNED: { label: "Returned", color: "bg-rose-500" },
}

const orderSteps: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [searchType, setSearchType] = useState<"order" | "tracking">("order")
  const [searchValue, setSearchValue] = useState("")
  const [order, setOrder] = useState<OrderDetailResponse | null>(null)
  const [trackingHistory, setTrackingHistory] = useState<TrackingRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const orderParam = searchParams.get("order")
    const codeParam = searchParams.get("code")
    
    if (codeParam) {
      setSearchType("tracking")
      setSearchValue(codeParam)
      handleSearch("tracking", codeParam)
    } else if (orderParam) {
      setSearchType("order")
      setSearchValue(orderParam)
      handleSearch("order", orderParam)
    }
  }, [searchParams])

  const handleSearch = async (type?: "order" | "tracking", value?: string) => {
    const searchT = type || searchType
    const searchV = value || searchValue

    if (!searchV.trim()) {
      setError("Please enter a search value")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSearched(true)

      let orderData: OrderDetailResponse
      
      if (searchT === "tracking") {
        orderData = await ordersApi.trackByCode(searchV)
      } else {
        orderData = await ordersApi.trackByNumber(searchV)
      }
      
      setOrder(orderData)

      // Get tracking history
      if (orderData.id) {
        try {
          const trackingData = await trackingApi.getByOrderId(orderData.id)
          setTrackingHistory(trackingData || [])
        } catch {
          setTrackingHistory([])
        }
      }
    } catch (err: any) {
      console.error("Failed to track order:", err)
      
      // Check if it's a cancelled order
      if (err?.details?.orderStatus === "CANCELLED" || err?.message?.includes("cancelled")) {
        setError("This order has been cancelled and is no longer available for tracking.")
      } else if (err?.details?.hint) {
        setError(err.details.hint + " " + (err.message || "Please try using the tracking code search option."))
      } else {
        setError(err?.details?.message || err?.message || "Order not found. Please check your order number or tracking code.")
      }
      
      setOrder(null)
      setTrackingHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    
    try {
      setCancelling(true)
      await ordersApi.cancelOrder(order.id, cancelReason)
      setOrder({ ...order, status: "CANCELLED" })
      toast.success("Order cancelled successfully")
      setCancelDialogOpen(false)
      setCancelReason("")
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const currentStatus = order?.status || "PENDING"
  const statusInfo = statusConfig[currentStatus] || statusConfig.PENDING
  const StatusIcon = statusInfo.icon
  const currentStepIndex = orderSteps.indexOf(currentStatus as OrderStatus)
  const isCancellable = currentStatus === "PENDING" || currentStatus === "CONFIRMED" || currentStatus === "PROCESSING"
  const isCancelled = currentStatus === "CANCELLED" || currentStatus === "REFUNDED"

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 via-amber-50/20 to-emerald-50/10">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <Truck className="w-4 h-4" />
            Order Tracking
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-800 mb-6">
            Track Your Order
          </h1>
          <p className="text-lg text-stone-600 mb-8">
            Enter your order number or tracking code to see delivery updates
          </p>

          {/* Search Tabs */}
          <div className="max-w-lg mx-auto">
            <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "order" | "tracking")} className="mb-4">
              <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur">
                <TabsTrigger value="order" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Order Number
                </TabsTrigger>
                <TabsTrigger value="tracking" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Tracking Code
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearch()
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  type="text"
                  placeholder={searchType === "order" ? "e.g., CMD001" : "e.g., SL-251205-XXXX"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-12 h-14 text-base bg-white border-stone-200 shadow-sm"
                />
              </div>
              <Button 
                type="submit" 
                className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Track Order
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur border-stone-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-16 h-16 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : error && searched ? (
            <Card className="bg-white/80 backdrop-blur border-red-200/50 text-center p-12">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-800 mb-2">Order Not Found</h2>
                <p className="text-stone-600 mb-6 max-w-md mx-auto">
                  {error}
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchValue("")
                  setSearched(false)
                  setError(null)
                }}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Status Card */}
              <Card className="bg-white/80 backdrop-blur border-stone-200/50 overflow-hidden">
                <div className={`h-1.5 ${statusInfo.bgColor}`} />
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm text-stone-500">Order Number</p>
                        <button 
                          onClick={() => copyToClipboard(order.orderNumber)}
                          className="p-1 hover:bg-stone-100 rounded transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                        </button>
                      </div>
                      <CardTitle className="font-serif text-2xl text-stone-800">{order.orderNumber}</CardTitle>
                      {order.trackingCode && (
                        <p className="text-sm text-stone-500 font-mono mt-1 flex items-center gap-2">
                          Tracking: {order.trackingCode}
                          <button 
                            onClick={() => copyToClipboard(order.trackingCode!)}
                            className="p-1 hover:bg-stone-100 rounded transition-colors"
                          >
                            <Copy className="w-3 h-3 text-stone-400" />
                          </button>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${statusInfo.bgColor} text-white px-4 py-2 text-sm`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {statusInfo.label}
                      </Badge>
                      {isCancellable && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setCancelDialogOpen(true)}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Description */}
                  <div className={`p-4 rounded-xl ${isCancelled ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    <p className={`${isCancelled ? 'text-red-700' : 'text-emerald-700'} font-medium`}>
                      {statusInfo.description}
                    </p>
                  </div>

                  {/* Progress Steps - Only show if not cancelled */}
                  {!isCancelled && (
                    <div className="py-4">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 h-1 bg-stone-200 -translate-y-1/2" />
                        <div 
                          className="absolute left-0 top-1/2 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-500"
                          style={{ width: `${Math.max(0, (currentStepIndex / (orderSteps.length - 1)) * 100)}%` }}
                        />
                        {orderSteps.map((step, index) => {
                          const stepConfig = statusConfig[step]
                          const StepIcon = stepConfig.icon
                          const isCompleted = currentStepIndex >= index
                          const isCurrent = currentStepIndex === index
                          
                          return (
                            <div key={step} className="relative flex flex-col items-center">
                              <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                                  isCompleted 
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                    : 'bg-white border-2 border-stone-200 text-stone-400'
                                } ${isCurrent ? 'ring-4 ring-emerald-500/20' : ''}`}
                              >
                                <StepIcon className="w-5 h-5" />
                              </div>
                              <span className={`text-xs mt-2 font-medium whitespace-nowrap ${
                                isCompleted ? 'text-emerald-600' : 'text-stone-400'
                              }`}>
                                {stepConfig.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Info Grid */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50">
                      <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        Order Date
                      </div>
                      <p className="font-semibold text-stone-800">{formatShortDate(order.orderDate)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-stone-50">
                      <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
                        <Truck className="w-4 h-4" />
                        Est. Delivery
                      </div>
                      <p className="font-semibold text-stone-800">{formatShortDate(order.estimatedDeliveryDate)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50">
                      <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
                        <ShoppingBag className="w-4 h-4" />
                        Total
                      </div>
                      <p className="font-serif font-bold text-amber-600 text-lg">{order.total.toFixed(2)} MAD</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-stone-200">
                    <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-stone-500 mb-1">Shipping Address</p>
                      <p className="font-medium text-stone-800">{order.shippingAddress}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <p className="text-sm text-stone-500 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Order Items ({order.itemCount})
                    </p>
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-stone-50"
                        >
                          <div>
                            <p className="font-medium text-stone-800">{item.productName}</p>
                            <p className="text-sm text-stone-500">
                              {item.size} × {item.quantity} • {item.unitPrice.toFixed(2)} MAD each
                            </p>
                          </div>
                          <p className="font-semibold text-amber-600">{item.totalPrice.toFixed(2)} MAD</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card className="bg-white/80 backdrop-blur border-stone-200/50">
                <CardHeader>
                  <CardTitle className="font-serif text-xl flex items-center gap-2 text-stone-800">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    Tracking History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trackingHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500">No tracking updates yet</p>
                      <p className="text-sm text-stone-400 mt-1">Check back soon for delivery updates</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-stone-200" />

                      <div className="space-y-6">
                        {trackingHistory.map((record, index) => {
                          const recordStatus = trackingStatusConfig[record.status] || trackingStatusConfig.PROCESSING

                          return (
                            <div
                              key={record.id}
                              className="relative flex gap-4 opacity-0 animate-in fade-in slide-in-from-left-4 fill-mode-forwards"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              {/* Icon */}
                              <div
                                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${recordStatus.color} shadow-lg`}
                              >
                                <PackageCheck className="w-5 h-5 text-white" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 pb-2">
                                <div className="flex items-start justify-between gap-4 bg-stone-50 rounded-xl p-4">
                                  <div>
                                    <Badge className={`${recordStatus.color} text-white mb-2`}>
                                      {recordStatus.label}
                                    </Badge>
                                    {record.location && (
                                      <p className="text-sm text-stone-600 flex items-center gap-1 mb-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {record.location}
                                      </p>
                                    )}
                                    {record.notes && (
                                      <p className="text-sm text-stone-500">{record.notes}</p>
                                    )}
                                  </div>
                                  <p className="text-xs text-stone-400 whitespace-nowrap">
                                    {formatDate(record.statusDate)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold mb-1">Need Help?</h3>
                      <p className="text-emerald-100">Our customer service team is here to assist you</p>
                    </div>
                    <Link href="/contact">
                      <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50">
                        Contact Us
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : searched ? null : (
            // Initial state - show tips
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur border-stone-200/50 p-8">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                    <Package className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">Order Number</h3>
                  <p className="text-stone-600">
                    Find your order number in the confirmation email we sent you (e.g., CMD001)
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur border-stone-200/50 p-8">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                    <Truck className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">Tracking Code</h3>
                  <p className="text-stone-600">
                    Use your unique tracking code to get real-time delivery updates (e.g., SL-251205-XXXX)
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order <strong>{order?.orderNumber}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tell us why you're cancelling this order..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder} disabled={cancelling}>
              {cancelling ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 via-amber-50/20 to-emerald-50/10">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
        <Footer />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}
