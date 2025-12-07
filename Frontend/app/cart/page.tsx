"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { 
  Trash2, Minus, Plus, ShoppingBag, ArrowRight, Check, CreditCard, 
  Truck, MapPin, Package, Calendar, Shield, Clock, Copy, ChevronLeft,
  AlertCircle, Sparkles, Gift, Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCart } from "@/lib/cart-context"
import { ordersApi, filesApi } from "@/lib/api"
import { toast } from "sonner"

type CheckoutStep = "cart" | "info" | "payment" | "done"

interface OrderResult {
  orderNumber: string;
  trackingCode: string;
  total: number;
  estimatedDelivery: string;
}

interface FormErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, totalItems } = useCart()
  const [step, setStep] = useState<CheckoutStep>("cart")
  const [loading, setLoading] = useState(false)
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    city: "",
    notes: "",
  })

  const shipping = subtotal >= 200 ? 0 : 30
  const total = subtotal + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Full name is required"
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address"
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required"
    } else if (!/^[\d\s+()-]{8,}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = "Please enter a valid phone number"
    }
    
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Shipping address is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinueToPayment = () => {
    if (validateForm()) {
      setStep("payment")
    } else {
      toast.error("Please fill in all required fields")
    }
    }

  const handleCheckout = async () => {
    try {
      setLoading(true)

      const fullAddress = formData.city 
        ? `${formData.shippingAddress}, ${formData.city}` 
        : formData.shippingAddress

      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: fullAddress,
        notes: formData.notes,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size.code,
        })),
      }

      const response = await ordersApi.create(orderData)

      if (response.success && response.order) {
        setOrderResult({
          orderNumber: response.order.orderNumber || "N/A",
          trackingCode: response.order.trackingCode || "",
          total: response.order.total || total,
          estimatedDelivery: response.order.estimatedDeliveryDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        })
        setStep("done")
        setShowSuccessDialog(true)
        clearCart()
        toast.success("Order placed successfully!")
      } else {
        throw new Error("Order creation failed")
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      toast.error(error.message || "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    { id: "cart", label: "Cart", icon: ShoppingBag },
    { id: "info", label: "Details", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "done", label: "Done", icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0]">
      <Header />

      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 ${
                        i <= currentStepIndex
                          ? "bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white shadow-lg shadow-[#556B2F]/30"
                          : "bg-[#556B2F]/10 text-[#556B2F]/40"
                      }`}
                    >
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        i <= currentStepIndex ? "text-[#556B2F]" : "text-[#556B2F]/40"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-colors duration-500 ${
                        i < currentStepIndex ? "bg-[#556B2F]" : "bg-[#556B2F]/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cart Step */}
          {step === "cart" && (
            <>
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#556B2F] mb-3">Shopping Cart</h1>
                <p className="text-[#556B2F]/60">Review your items before checkout</p>
              </div>

              {items.length === 0 ? (
                <Card className="bg-white border-[#556B2F]/10 p-12 text-center max-w-lg mx-auto">
                  <CardContent className="p-0">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#556B2F]/10 to-[#D6A64F]/10 flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="w-12 h-12 text-[#556B2F]/40" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-[#556B2F] mb-2">Your cart is empty</h2>
                    <p className="text-[#556B2F]/60 mb-8">
                      Discover our premium Moroccan products and add them to your cart.
                    </p>
                    <Link href="/category/honey">
                      <Button className="bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25">
                        <Sparkles className="mr-2 w-4 h-4" />
                        Start Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {items.map((item, index) => (
                      <Card
                        key={`${item.product.id}-${item.size.code}`}
                        className="bg-white/80 backdrop-blur border-[#556B2F]/10/50 overflow-hidden hover:shadow-lg transition-all duration-300 opacity-0 animate-in fade-in slide-in-from-left-4 fill-mode-forwards"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-0">
                          <div className="flex">
                            {/* Product Image */}
                            <Link href={`/product/${item.product.id}`} className="flex-shrink-0">
                              <div className="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden bg-gradient-to-br from-[#FAF7F0] to-[#D6A64F]/5">
                                <img
                                  src={filesApi.getImageUrl(item.product.imageUrl) || "/placeholder.svg"}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                              </div>
                            </Link>
                            
                            {/* Product Details */}
                            <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                <div>
                                    <Badge className="bg-[#D6A64F]/10 text-[#D6A64F] border-0 text-xs mb-2">
                                    {item.product.category.name}
                                    </Badge>
                                  <Link href={`/product/${item.product.id}`}>
                                      <h3 className="font-serif text-lg font-semibold text-[#556B2F] hover:text-[#556B2F] transition-colors line-clamp-1">
                                      {item.product.name}
                                    </h3>
                                  </Link>
                                    <p className="text-sm text-[#556B2F]/60 mt-0.5">{item.size.displayName}</p>
                                </div>
                                <button
                                  onClick={() => removeItem(item.product.id, item.size.code)}
                                    className="p-2 rounded-xl hover:bg-red-50 text-[#556B2F]/40 hover:text-red-500 transition-all"
                                    aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                {/* Quantity Controls */}
                                <div className="flex items-center bg-[#556B2F]/10 rounded-xl overflow-hidden">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.size.code, item.quantity - 1)}
                                    className="px-3 py-2 hover:bg-[#556B2F]/20 transition-colors disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4 text-[#556B2F]/80" />
                                  </button>
                                  <span className="px-4 py-2 font-semibold text-[#556B2F] min-w-[48px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.size.code, item.quantity + 1)}
                                    className="px-3 py-2 hover:bg-[#556B2F]/20 transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-[#556B2F]/80" />
                                  </button>
                                </div>
                                
                                {/* Price */}
                                <div className="text-right">
                                  <p className="text-xs text-[#556B2F]/40">{item.unitPrice.toFixed(2)} MAD each</p>
                                  <p className="text-xl font-serif font-bold text-[#D6A64F]">
                                  {(item.unitPrice * item.quantity).toFixed(2)} MAD
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="lg:col-span-1">
                    <Card className="bg-white/80 backdrop-blur border-[#556B2F]/10/50 sticky top-28 overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F]" />
                      <CardHeader className="pb-4">
                        <CardTitle className="font-serif text-xl text-[#556B2F]">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#556B2F]/60">Subtotal ({totalItems} items)</span>
                          <span className="font-medium text-[#556B2F]">{subtotal.toFixed(2)} MAD</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-[#556B2F]/60">Shipping</span>
                            {shipping === 0 ? (
                            <span className="font-medium text-[#556B2F] flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              Free
                            </span>
                            ) : (
                            <span className="font-medium text-[#556B2F]">{shipping.toFixed(2)} MAD</span>
                            )}
                        </div>
                        
                        {shipping > 0 && (
                          <div className="p-3 rounded-xl bg-[#D6A64F]/5 border border-[#D6A64F]/10">
                            <p className="text-xs text-[#D6A64F] flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Add {(200 - subtotal).toFixed(2)} MAD more for free shipping!
                            </p>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-[#556B2F]">Total</span>
                          <span className="text-2xl font-serif font-bold text-[#D6A64F]">{total.toFixed(2)} MAD</span>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF7F0]">
                            <Shield className="w-4 h-4 text-[#556B2F]" />
                            <span className="text-xs text-[#556B2F]/80">Secure</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF7F0]">
                            <Truck className="w-4 h-4 text-[#556B2F]" />
                            <span className="text-xs text-[#556B2F]/80">Fast Delivery</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25 h-12 text-base"
                          onClick={() => setStep("info")}
                        >
                          Proceed to Checkout
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        
                        <Link href="/" className="block">
                          <Button variant="ghost" className="w-full text-[#556B2F]/80 hover:text-[#556B2F]">
                            <ChevronLeft className="mr-2 w-4 h-4" />
                            Continue Shopping
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Information Step */}
          {step === "info" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#556B2F] mb-3">Shipping Details</h1>
                <p className="text-[#556B2F]/60">Where should we deliver your order?</p>
              </div>

              <Card className="bg-white/80 backdrop-blur border-[#556B2F]/10/50 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F]" />
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#556B2F]/10 flex items-center justify-center">
                        <span className="text-[#556B2F] font-bold text-sm">1</span>
                      </div>
                      Personal Information
                    </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-[#556B2F] font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                          className={`bg-white border-[#556B2F]/10 h-12 ${errors.customerName ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Enter your full name"
                        />
                        {errors.customerName && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.customerName}
                          </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerPhone" className="text-[#556B2F] font-medium">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                          className={`bg-white border-[#556B2F]/10 h-12 ${errors.customerPhone ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="+212 6XX XXX XXX"
                        />
                        {errors.customerPhone && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.customerPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-[#556B2F] font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className={`bg-white border-[#556B2F]/10 h-12 ${errors.customerEmail ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.customerEmail}
                      </p>
                    )}
                    <p className="text-xs text-[#556B2F]/40">We'll send order confirmation and tracking updates to this email</p>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#556B2F]/10 flex items-center justify-center">
                        <span className="text-[#556B2F] font-bold text-sm">2</span>
                      </div>
                      Shipping Address
                    </h3>
                    <div className="space-y-4">
                  <div className="space-y-2">
                        <Label htmlFor="shippingAddress" className="text-[#556B2F] font-medium">
                          Street Address <span className="text-red-500">*</span>
                        </Label>
                    <Textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                          className={`bg-white border-[#556B2F]/10 min-h-[80px] ${errors.shippingAddress ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Street name, building number, apartment..."
                        />
                        {errors.shippingAddress && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.shippingAddress}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-[#556B2F] font-medium">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="bg-white border-[#556B2F]/10 h-12"
                          placeholder="e.g., Casablanca, Rabat, Marrakech..."
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Notes */}
                  <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#556B2F]/10 flex items-center justify-center">
                        <span className="text-[#556B2F]/80 font-bold text-sm">3</span>
                      </div>
                      Additional Notes
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </h3>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="bg-white border-[#556B2F]/10"
                      placeholder="Any special instructions for delivery? (e.g., ring doorbell, leave at door...)"
                    />
                  </div>

                  {/* Order Summary Mini */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF7F0] to-[#D6A64F]/5/50 border border-[#556B2F]/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#556B2F]/80 text-sm">Items ({totalItems})</span>
                      <span className="text-[#556B2F] font-medium">{subtotal.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#556B2F]/80 text-sm">Shipping</span>
                      <span className={shipping === 0 ? "text-[#556B2F] font-medium" : "text-[#556B2F] font-medium"}>
                        {shipping === 0 ? "Free" : `${shipping.toFixed(2)} MAD`}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#556B2F]">Total</span>
                      <span className="text-xl font-serif font-bold text-[#D6A64F]">{total.toFixed(2)} MAD</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-[#556B2F]/10"
                      onClick={() => setStep("cart")}
                    >
                      <ChevronLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25 h-12"
                      onClick={handleContinueToPayment}
                    >
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#556B2F] mb-3">Payment</h1>
                <p className="text-[#556B2F]/60">Select your preferred payment method</p>
              </div>

              <Card className="bg-white/80 backdrop-blur border-[#556B2F]/10/50 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F]" />
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Payment Methods */}
                        <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#556B2F]" />
                      Payment Method
                    </h3>
                    <div className="space-y-3">
                      {/* Cash on Delivery - Selected */}
                      <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#556B2F] bg-[#556B2F]/5 cursor-pointer transition-all">
                        <input type="radio" name="payment" defaultChecked className="w-5 h-5 accent-emerald-600" />
                        <div className="w-12 h-12 rounded-xl bg-[#556B2F]/10 flex items-center justify-center">
                          <Truck className="w-6 h-6 text-[#556B2F]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#556B2F]">Cash on Delivery</p>
                          <p className="text-sm text-[#556B2F]/60">Pay when you receive your order</p>
                        </div>
                        <Badge className="bg-[#556B2F]/10 text-[#556B2F] border-0">Recommended</Badge>
                      </label>
                      
                      {/* Bank Transfer - Disabled */}
                      <div className="relative">
                        <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#556B2F]/10 bg-[#FAF7F0] opacity-60 cursor-not-allowed">
                          <input type="radio" name="payment" disabled className="w-5 h-5" />
                          <div className="w-12 h-12 rounded-xl bg-[#556B2F]/20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-[#556B2F]/40" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#556B2F]/60">Bank Transfer</p>
                            <p className="text-sm text-[#556B2F]/40">Pay via bank transfer</p>
                          </div>
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2">
                          <Badge className="bg-[#D6A64F]/10 text-[#D6A64F] border-0">Coming Soon</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Review */}
                  <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#556B2F]" />
                      Order Review
                    </h3>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                      {items.map((item) => (
                        <div key={`${item.product.id}-${item.size.code}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF7F0]">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
                            <img
                              src={filesApi.getImageUrl(item.product.imageUrl) || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#556B2F] truncate">{item.product.name}</p>
                            <p className="text-xs text-[#556B2F]/60">{item.size.displayName} × {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-[#D6A64F]">{(item.unitPrice * item.quantity).toFixed(2)} MAD</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Info Summary */}
                  <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#556B2F]" />
                      Delivery Details
                    </h3>
                    <div className="p-4 rounded-xl bg-[#FAF7F0] space-y-2">
                      <p className="font-medium text-[#556B2F]">{formData.customerName}</p>
                      <p className="text-sm text-[#556B2F]/80">{formData.shippingAddress}{formData.city && `, ${formData.city}`}</p>
                      <p className="text-sm text-[#556B2F]/80">{formData.customerPhone}</p>
                      <p className="text-sm text-[#556B2F]/80">{formData.customerEmail}</p>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-[#D6A64F]/5 border border-[#556B2F]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#556B2F]/80">Subtotal</span>
                      <span className="text-[#556B2F]">{subtotal.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#556B2F]/80">Shipping</span>
                      <span className={shipping === 0 ? "text-[#556B2F]" : "text-[#556B2F]"}>
                        {shipping === 0 ? "Free" : `${shipping.toFixed(2)} MAD`}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-[#556B2F]">Total to Pay</span>
                      <span className="text-2xl font-serif font-bold text-[#D6A64F]">{total.toFixed(2)} MAD</span>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Estimated Delivery</p>
                      <p className="text-sm text-blue-600">3-5 business days</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-[#556B2F]/10"
                      onClick={() => setStep("info")}
                    >
                      <ChevronLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25 h-12"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Clock className="mr-2 w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 w-4 h-4" />
                          Place Order
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2 text-xs text-[#556B2F]/40">
                    <Shield className="w-4 h-4" />
                    Your information is secure and encrypted
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Done Step */}
          {step === "done" && orderResult && (
            <div className="max-w-lg mx-auto text-center">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#556B2F] to-[#6B8E23] flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500 shadow-2xl shadow-[#556B2F]/40">
                <Check className="w-14 h-14 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#556B2F] mb-4">
                Thank You!
              </h1>
              <p className="text-xl text-[#556B2F]/80 mb-8">
                Your order has been placed successfully
              </p>
              
              {/* Order Details Card */}
              <Card className="bg-white/80 backdrop-blur border-[#556B2F]/10/50 mb-8 text-left overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F]" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#556B2F]/60">Order Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#556B2F]">{orderResult.orderNumber}</span>
                      <button 
                        onClick={() => copyToClipboard(orderResult.orderNumber)}
                        className="p-1.5 rounded-lg hover:bg-[#556B2F]/10 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-[#556B2F]/40" />
                      </button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#556B2F]/60">Tracking Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#556B2F]">{orderResult.trackingCode}</span>
                      <button 
                        onClick={() => copyToClipboard(orderResult.trackingCode)}
                        className="p-1.5 rounded-lg hover:bg-[#556B2F]/10 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-[#556B2F]/40" />
                      </button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#556B2F]/60">Total Paid</span>
                    <span className="text-xl font-serif font-bold text-[#D6A64F]">
                      {typeof orderResult.total === 'number' ? orderResult.total.toFixed(2) : total.toFixed(2)} MAD
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#556B2F]/60">Est. Delivery</span>
                    <span className="font-medium text-[#556B2F]">
                      {orderResult.estimatedDelivery 
                        ? new Date(orderResult.estimatedDelivery).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : "3-5 business days"
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-[#556B2F]/5 border border-[#556B2F]/10 mb-8">
                <p className="text-sm text-[#556B2F]">
                  <strong>Save your tracking code:</strong> <span className="font-mono font-bold">{orderResult.trackingCode}</span>
                  <br />
                  <span className="text-[#556B2F]">You can use it anytime to track your order status</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/track-order?code=${orderResult.trackingCode}`}>
                  <Button className="w-full sm:w-auto bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25 h-12 px-8">
                    <Truck className="mr-2 w-5 h-5" />
                    Track Order
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-[#556B2F]/10">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-[#FAF7F0] border-[#556B2F]/20 max-w-md">
          <DialogHeader>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#556B2F] to-[#6B8E23] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#556B2F]/30">
              <Check className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-center font-serif text-2xl text-[#556B2F]">Order Confirmed!</DialogTitle>
            <DialogDescription asChild>
              <div className="text-center space-y-3 pt-2">
                <span className="block text-[#556B2F]/70">Your order has been placed successfully.</span>
                {orderResult && (
                  <div className="bg-white rounded-xl p-4 space-y-3 text-left border border-[#556B2F]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[#556B2F]/60 text-sm">Order</span>
                      <span className="font-mono font-bold text-[#556B2F]">{orderResult.orderNumber}</span>
                    </div>
                    <Separator className="bg-[#556B2F]/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-[#556B2F]/60 text-sm">Tracking</span>
                      <span className="font-mono font-bold text-[#D6A64F]">{orderResult.trackingCode}</span>
                    </div>
                  </div>
                )}
                <span className="block text-sm text-[#556B2F]/60">
                  We'll send order details and tracking updates to your email.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-[#556B2F]/20 text-[#556B2F] hover:bg-[#556B2F]/5"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
            {orderResult && (
              <Link href={`/track-order?code=${orderResult.trackingCode}`} className="flex-1">
                <Button className="w-full bg-[#556B2F] hover:bg-[#556B2F]/90 text-white">
                  <Truck className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </Link>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
