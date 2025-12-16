"use client"

import { useState, useEffect } from "react"
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
import { useTranslation } from "@/lib/translation-context"
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
  const { t, format, language } = useTranslation()
  const { items, removeItem, updateQuantity, subtotal, clearCart, totalItems } = useCart()
  const [step, setStep] = useState<CheckoutStep>("cart")
  const [loading, setLoading] = useState(false)
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [copied, setCopied] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  // Debug: Log cart items
  useEffect(() => {
    console.log('Cart Items:', items)
    console.log('Total Items:', totalItems)
    console.log('Subtotal:', subtotal)
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('silea_cart')
      console.log('LocalStorage Cart:', savedCart)
    }
  }, [items, totalItems, subtotal])

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
    { id: "cart", label: t.cart.steps.cart, icon: ShoppingBag },
    { id: "info", label: t.cart.steps.details, icon: MapPin },
    { id: "payment", label: t.cart.steps.payment, icon: CreditCard },
    { id: "done", label: t.cart.steps.done, icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#556B2F]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '20s' }} />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#D6A64F]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '25s' }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-[#556B2F]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s', animationDuration: '22s' }} />
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-[#D6A64F]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s', animationDuration: '18s' }} />
        
        {/* Floating Icons */}
        <div className="absolute top-32 right-32 opacity-5 animate-float" style={{ animationDelay: '1s', animationDuration: '15s' }}>
          <ShoppingBag className="w-24 h-24 text-[#556B2F]" />
        </div>
        <div className="absolute bottom-32 left-32 opacity-5 animate-float" style={{ animationDelay: '3s', animationDuration: '18s' }}>
          <Sparkles className="w-20 h-20 text-[#D6A64F]" />
        </div>
        <div className="absolute top-1/2 left-20 opacity-5 animate-float" style={{ animationDelay: '5s', animationDuration: '20s' }}>
          <Gift className="w-16 h-16 text-[#556B2F]" />
        </div>
        <div className="absolute top-1/3 right-40 opacity-5 animate-float" style={{ animationDelay: '7s', animationDuration: '16s' }}>
          <Heart className="w-18 h-18 text-[#D6A64F]" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#556B2F]/3 via-transparent to-[#D6A64F]/3 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      <Header />

      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex-1 relative z-10">
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
              <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#556B2F] mb-3 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">
                  {t.cart.title}
                </h1>
                <p className="text-[#556B2F]/60 text-lg">{t.cart.subtitle}</p>
                
                {/* Debug Info - Remove in production */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-xs border-[#556B2F]/20"
                  >
                    {showDebug ? 'Hide' : 'Show'} Debug Info
                  </Button>
                </div>
                
                {showDebug && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left max-w-2xl mx-auto text-xs">
                    <p className="font-semibold mb-2">Cart Debug Information:</p>
                    <p><strong>Items Count:</strong> {items.length}</p>
                    <p><strong>Total Items (quantity):</strong> {totalItems}</p>
                    <p><strong>Subtotal:</strong> {subtotal.toFixed(2)} MAD</p>
                    <p><strong>Items in Cart:</strong></p>
                    <pre className="mt-2 p-2 bg-white rounded overflow-auto max-h-40 text-[10px]">
                      {JSON.stringify(items, null, 2)}
                    </pre>
                    {typeof window !== 'undefined' && (
                      <p className="mt-2"><strong>LocalStorage:</strong> {localStorage.getItem('silea_cart') || 'Empty'}</p>
                    )}
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-md border-[#556B2F]/20 p-12 text-center max-w-lg mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/5 to-[#D6A64F]/5 rounded-lg" />
                  <CardContent className="p-0 relative z-10">
                    <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#556B2F]/20 to-[#D6A64F]/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <ShoppingBag className="w-14 h-14 text-[#556B2F]/60" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#556B2F] mb-3">{t.cart.empty.title}</h2>
                    <p className="text-[#556B2F]/70 mb-8 text-lg">
                      {t.cart.empty.description}
                    </p>
                    <Link href="/category/honey">
                      <Button className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:from-[#4A5F29] hover:to-[#5F7D1F] shadow-lg shadow-[#556B2F]/25 text-white h-12 px-8 text-base transition-all duration-300 hover:scale-105">
                        <Sparkles className="mr-2 w-5 h-5" />
                        {t.cart.empty.startShopping}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Order Summary - Now on LEFT */}
                  <div className="lg:col-span-1 lg:order-1">
                    <Card className="bg-white/95 backdrop-blur-md border-[#556B2F]/20 sticky top-28 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                      <div className="h-2 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ animation: 'shimmer 3s infinite' }} />
                      </div>
                      <CardHeader className="pb-4 bg-gradient-to-br from-[#556B2F]/5 to-[#D6A64F]/5">
                        <CardTitle className="font-serif text-2xl text-[#556B2F] flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          {t.cart.orderSummary}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5 p-6">
                        <div className="flex justify-between text-sm py-2 border-b border-[#556B2F]/10">
                          <span className="text-[#556B2F]/70 font-medium">{t.common.subtotal} ({totalItems} {totalItems === 1 ? t.cart.item : t.cart.items})</span>
                          <span className="font-semibold text-[#556B2F]">{subtotal.toFixed(2)} MAD</span>
                        </div>
                        
                        <div className="flex justify-between text-sm py-2 border-b border-[#556B2F]/10">
                          <span className="text-[#556B2F]/70 font-medium">{t.common.shipping}</span>
                          <span className="font-semibold text-[#556B2F] flex items-center gap-1.5">
                            <Gift className="w-4 h-4 text-[#D6A64F]" />
                            <span className="text-[#D6A64F]">{t.common.free}</span>
                          </span>
                        </div>
                        
                        <Separator className="bg-gradient-to-r from-transparent via-[#556B2F]/20 to-transparent" />
                        
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xl font-bold text-[#556B2F]">{t.common.total}</span>
                          <span className="text-3xl font-serif font-bold bg-gradient-to-r from-[#D6A64F] to-[#E8B960] bg-clip-text text-transparent">{total.toFixed(2)} MAD</span>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF7F0]">
                            <Shield className="w-4 h-4 text-[#556B2F]" />
                            <span className="text-xs text-[#556B2F]/80">{t.common.secure}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF7F0]">
                            <Truck className="w-4 h-4 text-[#556B2F]" />
                            <span className="text-xs text-[#556B2F]/80">{t.common.fastDelivery}</span>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:from-[#4A5F29] hover:to-[#5F7D1F] shadow-lg shadow-[#556B2F]/30 h-14 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                          onClick={() => setStep("info")}
                        >
                          {t.cart.proceedToCheckout}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        
                        <Link href="/" className="block">
                          <Button variant="ghost" className="w-full text-[#556B2F]/80 hover:text-[#556B2F]">
                            <ChevronLeft className="mr-2 w-4 h-4" />
                            {t.cart.continueShopping}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cart Items - Now on RIGHT */}
                  <div className="lg:col-span-2 lg:order-2 space-y-4">
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-[#556B2F]/60">No items in cart</p>
                      </div>
                    ) : (
                      items.map((item, index) => {
                        console.log('Rendering cart item:', item.product.name, item.size.displayName, index)
                        return (
                          <Card
                            key={`${item.product.id}-${item.size.code}`}
                            className="bg-white/90 backdrop-blur-md border-2 border-[#556B2F]/30 overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                            style={{ 
                              animation: `fadeInSlide 0.6s ease-out ${index * 0.1}s forwards`,
                            }}
                          >
                        <CardContent className="p-0 relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#556B2F]/5 via-transparent to-[#D6A64F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="flex relative z-10">
                            {/* Product Image */}
                            <Link href={`/product/${item.product.id}`} className="flex-shrink-0 group/image">
                              <div className="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden bg-gradient-to-br from-[#FAF7F0] to-[#D6A64F]/10 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/5 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                                <img
                                  src={filesApi.getImageUrl(item.product.imageUrl) || "/placeholder.svg"}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-125"
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
                                      {language === 'ar' && item.product.nameAr ? item.product.nameAr : item.product.name}
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
                                <div className="flex items-center bg-gradient-to-r from-[#556B2F]/10 to-[#556B2F]/5 rounded-xl overflow-hidden border border-[#556B2F]/10">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.size.code, item.quantity - 1)}
                                    className="px-3 py-2 hover:bg-[#556B2F]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4 text-[#556B2F]/80" />
                                  </button>
                                  <span className="px-4 py-2 font-semibold text-[#556B2F] min-w-[48px] text-center bg-white/50">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.size.code, item.quantity + 1)}
                                    className="px-3 py-2 hover:bg-[#556B2F]/20 transition-all duration-200 active:scale-95"
                                  >
                                    <Plus className="w-4 h-4 text-[#556B2F]/80" />
                                  </button>
                                </div>
                                
                                {/* Price */}
                                <div className="text-right">
                                  <p className="text-xs text-[#556B2F]/50 mb-1">{item.unitPrice.toFixed(2)} MAD each</p>
                                  <p className="text-2xl font-serif font-bold bg-gradient-to-r from-[#D6A64F] to-[#E8B960] bg-clip-text text-transparent">
                                  {(item.unitPrice * item.quantity).toFixed(2)} MAD
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Information Step */}
          {step === "info" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#556B2F] mb-3">{t.cart.shippingDetails.title}</h1>
                <p className="text-[#556B2F]/60">{t.cart.shippingDetails.subtitle}</p>
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
                      {t.cart.shippingDetails.personalInfo}
                    </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-[#556B2F] font-medium">
                          {t.cart.shippingDetails.fullName} <span className="text-red-500">{t.cart.labels.required}</span>
                        </Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                          className={`bg-white border-[#556B2F]/10 h-12 ${errors.customerName ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder={t.cart.placeholders.fullName}
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
                          {t.cart.shippingDetails.phoneNumber} <span className="text-red-500">{t.cart.labels.required}</span>
                        </Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                          className={`bg-white border-[#556B2F]/10 h-12 ${errors.customerPhone ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder={t.cart.placeholders.phone}
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
                      {t.cart.shippingDetails.emailAddress} <span className="text-red-500">{t.cart.labels.required}</span>
                    </Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className={`bg-white border-[#556B2F]/10 h-12 ${errors.customerEmail ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder={t.cart.placeholders.email}
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.customerEmail}
                      </p>
                    )}
                    <p className="text-xs text-[#556B2F]/40">{t.cart.shippingDetails.emailHint}</p>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#556B2F]/10 flex items-center justify-center">
                        <span className="text-[#556B2F] font-bold text-sm">2</span>
                      </div>
                      {t.cart.shippingDetails.shippingAddress}
                    </h3>
                    <div className="space-y-4">
                  <div className="space-y-2">
                        <Label htmlFor="shippingAddress" className="text-[#556B2F] font-medium">
                          {t.cart.shippingDetails.streetAddress} <span className="text-red-500">{t.cart.labels.required}</span>
                        </Label>
                    <Textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                          className={`bg-white border-[#556B2F]/10 min-h-[80px] ${errors.shippingAddress ? 'border-red-500 focus:ring-red-500' : ''}`}
                          placeholder={t.cart.placeholders.streetAddress}
                        />
                        {errors.shippingAddress && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.shippingAddress}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-[#556B2F] font-medium">{t.cart.shippingDetails.city}</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="bg-white border-[#556B2F]/10 h-12"
                          placeholder={t.cart.placeholders.city}
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
                      {t.cart.shippingDetails.additionalNotes}
                      <Badge variant="secondary" className="text-xs">{t.cart.shippingDetails.optional}</Badge>
                    </h3>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="bg-white border-[#556B2F]/10"
                      placeholder={t.cart.shippingDetails.notesPlaceholder}
                    />
                  </div>

                  {/* Order Summary Mini */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF7F0] to-[#D6A64F]/5/50 border border-[#556B2F]/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#556B2F]/80 text-sm">{t.cart.items} ({totalItems})</span>
                      <span className="text-[#556B2F] font-medium">{subtotal.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#556B2F]/80 text-sm">{t.common.shipping}</span>
                      <span className={shipping === 0 ? "text-[#556B2F] font-medium" : "text-[#556B2F] font-medium"}>
                        {shipping === 0 ? t.common.free : `${shipping.toFixed(2)} MAD`}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#556B2F]">{t.common.total}</span>
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
                      {t.common.back}
                    </Button>
                    <Button
                      className="flex-1 bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25 h-12"
                      onClick={handleContinueToPayment}
                    >
                      {t.common.continue}
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
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#556B2F] mb-3">{t.cart.payment.title}</h1>
                <p className="text-[#556B2F]/60">{t.cart.payment.subtitle}</p>
              </div>

              <Card className="bg-white/80 backdrop-blur border-[#556B2F]/10/50 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F]" />
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Payment Methods */}
                        <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#556B2F]" />
                      {t.cart.payment.method}
                    </h3>
                    <div className="space-y-3">
                      {/* Cash on Delivery - Selected */}
                      <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#556B2F] bg-[#556B2F]/5 cursor-pointer transition-all">
                        <input type="radio" name="payment" defaultChecked className="w-5 h-5 accent-emerald-600" />
                        <div className="w-12 h-12 rounded-xl bg-[#556B2F]/10 flex items-center justify-center">
                          <Truck className="w-6 h-6 text-[#556B2F]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#556B2F]">{t.cart.payment.cashOnDelivery}</p>
                          <p className="text-sm text-[#556B2F]/60">{t.cart.payment.cashOnDeliveryDesc}</p>
                        </div>
                        <Badge className="bg-[#556B2F]/10 text-[#556B2F] border-0">{t.cart.payment.recommended}</Badge>
                      </label>
                      
                      {/* Bank Transfer - Disabled */}
                      <div className="relative">
                        <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#556B2F]/10 bg-[#FAF7F0] opacity-60 cursor-not-allowed">
                          <input type="radio" name="payment" disabled className="w-5 h-5" />
                          <div className="w-12 h-12 rounded-xl bg-[#556B2F]/20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-[#556B2F]/40" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#556B2F]/60">{t.cart.payment.bankTransfer}</p>
                            <p className="text-sm text-[#556B2F]/40">{t.cart.payment.bankTransferDesc}</p>
                          </div>
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2">
                          <Badge className="bg-[#D6A64F]/10 text-[#D6A64F] border-0">{t.cart.payment.comingSoon}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Review */}
                  <div>
                    <h3 className="font-semibold text-[#556B2F] mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#556B2F]" />
                      {t.cart.payment.orderReview}
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
                            <p className="font-medium text-[#556B2F] truncate">{language === 'ar' && item.product.nameAr ? item.product.nameAr : item.product.name}</p>
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
                      {t.cart.payment.deliveryDetails}
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
                      <span className="text-[#556B2F]/80">{t.common.subtotal}</span>
                      <span className="text-[#556B2F]">{subtotal.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#556B2F]/80">{t.common.shipping}</span>
                      <span className={shipping === 0 ? "text-[#556B2F]" : "text-[#556B2F]"}>
                        {shipping === 0 ? t.common.free : `${shipping.toFixed(2)} MAD`}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-[#556B2F]">{t.cart.success.totalToPay}</span>
                      <span className="text-2xl font-serif font-bold text-[#D6A64F]">{total.toFixed(2)} MAD</span>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">{t.cart.payment.estimatedDelivery}</p>
                      <p className="text-sm text-blue-600">3-5 {t.cart.payment.days}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-[#556B2F]/10"
                      onClick={() => setStep("info")}
                    >
                      <ChevronLeft className="mr-2 w-4 h-4" />
                      {t.common.back}
                    </Button>
                    <Button
                      className="flex-1 bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25 h-12"
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Clock className="mr-2 w-4 h-4 animate-spin" />
                          {t.cart.payment.processing}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 w-4 h-4" />
                          {t.cart.payment.placeOrder}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2 text-xs text-[#556B2F]/40">
                    <Shield className="w-4 h-4" />
                    {t.cart.payment.securityNote}
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
                {t.cart.success.thankYou}
              </h1>
              <p className="text-xl text-[#556B2F]/80 mb-8">
                {t.cart.success.orderPlaced}
              </p>
              
              {/* Order Details Card */}
              <Card className="bg-white/80 backdrop-blur border-[#556B2F]/10/50 mb-8 text-left overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-[#556B2F] via-[#D6A64F] to-[#556B2F]" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#556B2F]/60">{t.cart.success.orderNumber}</span>
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
                    <span className="text-[#556B2F]/60">{t.cart.success.trackingCode}</span>
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
                    <span className="text-[#556B2F]/60">{t.cart.success.totalToPay}</span>
                    <span className="text-xl font-serif font-bold text-[#D6A64F]">
                      {typeof orderResult.total === 'number' ? orderResult.total.toFixed(2) : total.toFixed(2)} MAD
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[#556B2F]/60">{t.cart.success.estimatedDelivery}</span>
                    <span className="font-medium text-[#556B2F]">
                      {orderResult.estimatedDelivery 
                        ? new Date(orderResult.estimatedDelivery).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : `3-5 ${t.cart.payment.days}`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-[#556B2F]/5 border border-[#556B2F]/10 mb-8">
                <p className="text-sm text-[#556B2F]">
                  <strong>{t.cart.success.saveTrackingCode}</strong> <span className="font-mono font-bold">{orderResult.trackingCode}</span>
                  <br />
                  <span className="text-[#556B2F]">{t.cart.success.trackingHint}</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/track-order?code=${orderResult.trackingCode}`}>
                  <Button className="w-full sm:w-auto bg-[#556B2F] hover:bg-[#556B2F]/90 shadow-lg shadow-[#556B2F]/25 h-12 px-8">
                    <Truck className="mr-2 w-5 h-5" />
                    {t.cart.success.trackOrder}
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto h-12 px-8 border-[#556B2F]/10">
                    {t.cart.success.continueShopping}
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
            <DialogTitle className="text-center font-serif text-2xl text-[#556B2F]">{t.cart.success.orderConfirmed}</DialogTitle>
            <DialogDescription asChild>
              <div className="text-center space-y-3 pt-2">
                <span className="block text-[#556B2F]/70">{t.cart.success.orderPlaced}</span>
                {orderResult && (
                  <div className="bg-white rounded-xl p-4 space-y-3 text-left border border-[#556B2F]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[#556B2F]/60 text-sm">{t.cart.success.order}</span>
                      <span className="font-mono font-bold text-[#556B2F]">{orderResult.orderNumber}</span>
                    </div>
                    <Separator className="bg-[#556B2F]/10" />
                    <div className="flex justify-between items-center">
                      <span className="text-[#556B2F]/60 text-sm">{t.cart.success.tracking}</span>
                      <span className="font-mono font-bold text-[#D6A64F]">{orderResult.trackingCode}</span>
                    </div>
                  </div>
                )}
                <span className="block text-sm text-[#556B2F]/60">
                  {t.cart.success.emailConfirmation}
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
              {t.cart.success.close}
            </Button>
            {orderResult && (
              <Link href={`/track-order?code=${orderResult.trackingCode}`} className="flex-1">
                <Button className="w-full bg-[#556B2F] hover:bg-[#556B2F]/90 text-white">
                  <Truck className="w-4 h-4 mr-2" />
                  {t.cart.success.trackOrder}
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
