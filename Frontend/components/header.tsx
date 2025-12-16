"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingCart, Search, User, Package, Minus, Plus, Trash2, ArrowRight, Gift, Truck, Shield, Sparkles } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useTranslation } from "@/lib/translation-context"
import { filesApi, publicCategoriesApi, type Category } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: 'en' as const, label: 'EN' },
  { code: 'fr' as const, label: 'FR' },
  { code: 'ar' as const, label: 'العربية' },
]

export default function Header() {
  const { language, setLanguage, t, format } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const pathname = usePathname()
  const { totalItems, items, subtotal, removeItem, updateQuantity } = useCart()
  const [hasMounted, setHasMounted] = useState(false)

  const getLocalizedCategoryLabel = (category: Category) => {
    const slugSource = (category.slug || category.name || '').toLowerCase()
    if (slugSource.includes('honey')) {
      return t.nav.categories.honey
    }
    if (slugSource.includes('oil')) {
      return t.nav.categories.oils
    }
    if (language === 'ar' && category.nameAr) {
      return category.nameAr
    }
    return category.name
  }

  // Build nav items with translations
  const staticNavItems = [
    { label: t.common.home, href: "/" },
  ]

  const endNavItems = [
    { label: t.common.about, href: "/about" },
    { label: t.common.contact, href: "/contact" },
  ]

  const shipping = subtotal >= 200 ? 0 : 30
  const total = subtotal + shipping
  const freeShippingProgress = Math.min((subtotal / 200) * 100, 100)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await publicCategoriesApi.getAll()
        setCategories(data)
      } catch (err) {
        console.error("Failed to fetch categories for header:", err)
      }
    }
    fetchCategories()
  }, [])

  // Build dynamic nav items
  const navItems = [
    ...staticNavItems,
    ...categories.map(cat => ({
      label: getLocalizedCategoryLabel(cat),
      href: `/category/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`,
    })),
    ...endNavItems,
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const renderCartButton = () => (
    <button
      className={`relative p-1.5 rounded-lg transition-all duration-300 group ${
        scrolled || !isHomePage
          ? "hover:bg-[#556B2F]/10"
          : "hover:bg-white/10"
      }`}
    >
      <ShoppingCart
        className={`w-4 h-4 transition-colors duration-300 ${
          scrolled || !isHomePage
            ? "text-foreground/70 group-hover:text-[#556B2F]"
            : "text-white drop-shadow-md group-hover:text-white"
        }`}
      />
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-[#D6A64F] to-[#E8B960] text-[10px] rounded-full flex items-center justify-center text-[#2F3526] font-bold shadow-md animate-in zoom-in duration-200">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  )

  const isHomePage = pathname === "/"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHomePage
          ? "glass-card border-b border-white/20 py-1.5"
          : "py-2"
      } ${!scrolled && isHomePage ? "backdrop-blur-md" : ""}`}
    >
      {/* Background overlay for better visibility on homepage */}
      {isHomePage && !scrolled && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />
      )}
      
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-all duration-500 group-hover:scale-105">
            <img
              src="/logo.png"
              alt="Silea Logo"
              className="h-12 w-auto sm:h-16 md:h-20 object-contain drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 text-xs font-medium transition-all duration-300 rounded-md group ${
                  pathname === item.href
                    ? scrolled || !isHomePage
                      ? "text-[#556B2F] bg-[#556B2F]/10"
                      : "text-white drop-shadow-lg bg-white/10"
                    : scrolled || !isHomePage
                    ? "text-foreground/80 hover:text-[#556B2F] hover:bg-[#556B2F]/5"
                    : "text-white/90 drop-shadow-md hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
                {/* Active indicator */}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                    pathname === item.href
                      ? "w-5 bg-gradient-to-r from-[#556B2F] to-[#D6A64F]"
                      : "w-0 bg-[#D6A64F] group-hover:w-3"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`hidden sm:flex h-8 w-8 transition-colors duration-300 ${
                scrolled || !isHomePage
                  ? "text-foreground/70 hover:text-[#556B2F] hover:bg-[#556B2F]/10"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search className={`w-4 h-4 ${
                scrolled || !isHomePage ? "" : "drop-shadow-md"
              }`} />
            </Button>

            {/* Track Order */}
            <Link href="/track-order">
              <Button
                variant="ghost"
                size="icon"
                className={`hidden sm:flex h-8 w-8 transition-colors duration-300 ${
                  scrolled || !isHomePage
                    ? "text-foreground/70 hover:text-[#556B2F] hover:bg-[#556B2F]/10"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                <Package className={`w-4 h-4 ${
                  scrolled || !isHomePage ? "" : "drop-shadow-md"
                }`} />
              </Button>
            </Link>

            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-300 ${
                    language === lang.code
                      ? "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white shadow-md"
                      : scrolled || !isHomePage
                      ? "text-foreground/60 hover:text-[#556B2F] hover:bg-[#556B2F]/10"
                      : "text-white/90 drop-shadow-sm hover:text-white hover:bg-white/20"
                  } ${lang.code === 'ar' ? 'font-arabic' : ''}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Cart */}
            {hasMounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  {renderCartButton()}
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md p-0 border-l-0 bg-[#FAF7F0]">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#556B2F] to-[#6B8E23] p-6 text-white">
                  <SheetHeader>
                    <SheetTitle className="font-serif text-2xl text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      {t.header.cart}
                    </SheetTitle>
                  </SheetHeader>
                  {totalItems > 0 && (
                    <p className="text-white/80 text-sm mt-2">
                      {totalItems} {totalItems > 1 ? t.header.items : t.header.item} {t.header.inCart}
                    </p>
                  )}
                </div>
                
                {/* Cart Content */}
                <div className="flex-1 overflow-auto p-6" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#556B2F]/10 to-[#D6A64F]/10 flex items-center justify-center mb-6">
                        <ShoppingCart className="w-10 h-10 text-[#556B2F]/30" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-[#556B2F] mb-2">{t.header.emptyCart}</h3>
                      <p className="text-[#556B2F]/60 mb-6 max-w-[200px]">
                        {t.cart.empty.description}
                      </p>
                      <Link href="/category/honey">
                        <Button className="bg-[#556B2F] hover:bg-[#556B2F]/90 text-white shadow-lg shadow-[#556B2F]/20">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t.cart.empty.startShopping}
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={`${item.product.id}-${item.size.code}`}
                          className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-[#556B2F]/5 animate-in fade-in slide-in-from-right-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <Link href={`/product/${item.product.id}`} className="flex-shrink-0">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#FAF7F0] to-[#D6A64F]/10 ring-2 ring-[#556B2F]/5">
                                <img
                                  src={filesApi.getImageUrl(item.product.imageUrl) || "/placeholder.svg"}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>
                            </Link>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <Badge className="bg-[#D6A64F]/10 text-[#D6A64F] border-0 text-[10px] mb-1.5">
                                    {item.product.category.name}
                                  </Badge>
                                  <Link href={`/product/${item.product.id}`}>
                                    <h4 className="font-semibold text-[#556B2F] text-sm leading-tight hover:text-[#D6A64F] transition-colors line-clamp-1">
                                      {item.product.name}
                                    </h4>
                                  </Link>
                                  <p className="text-xs text-[#556B2F]/50 mt-0.5">{item.size.displayName}</p>
                                </div>
                                <button
                                  onClick={() => removeItem(item.product.id, item.size.code)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-[#556B2F]/30 hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                {/* Quantity Controls */}
                                <div className="flex items-center bg-[#FAF7F0] rounded-lg overflow-hidden border border-[#556B2F]/10">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.size.code, item.quantity - 1)}
                                    className="px-2 py-1 hover:bg-[#556B2F]/10 transition-colors disabled:opacity-40"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="w-3 h-3 text-[#556B2F]" />
                                  </button>
                                  <span className="px-3 py-1 font-semibold text-sm text-[#556B2F] min-w-[32px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.size.code, item.quantity + 1)}
                                    className="px-2 py-1 hover:bg-[#556B2F]/10 transition-colors"
                                  >
                                    <Plus className="w-3 h-3 text-[#556B2F]" />
                                  </button>
                                </div>
                                
                                {/* Price */}
                                <span className="font-serif font-bold text-[#D6A64F]">
                                  {(item.unitPrice * item.quantity).toFixed(2)} MAD
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#556B2F]/10 p-6 space-y-4">
                    {/* Price Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#556B2F]/60">{t.common.subtotal}</span>
                        <span className="text-[#556B2F]">{subtotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#556B2F]/60">{t.common.shipping}</span>
                        {shipping === 0 ? (
                          <span className="text-[#556B2F] font-medium flex items-center gap-1">
                            <Gift className="w-3 h-3 text-[#D6A64F]" />
                            {t.common.free}
                          </span>
                        ) : (
                          <span className="text-[#556B2F]">{shipping.toFixed(2)} MAD</span>
                        )}
                      </div>
                      <Separator className="bg-[#556B2F]/10 my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#556B2F]">{t.common.total}</span>
                        <span className="text-2xl font-serif font-bold text-[#D6A64F]">{total.toFixed(2)} MAD</span>
                      </div>
                    </div>
                    
                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-4 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#556B2F]/50">
                        <Shield className="w-3 h-3" />
                        {t.common.secure}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#556B2F]/50">
                        <Truck className="w-3 h-3" />
                        {t.common.fastDelivery}
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Link href="/cart" className="block">
                      <Button className="w-full h-12 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] hover:from-[#4a5f29] hover:to-[#5a7a1e] text-white font-semibold shadow-lg shadow-[#556B2F]/30 transition-all duration-300">
                        {t.header.checkout}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    
                    <Link href="/" className="block">
                      <Button variant="ghost" className="w-full text-[#556B2F] hover:text-[#556B2F] hover:bg-[#556B2F]/5">
                        {t.header.continueShopping}
                      </Button>
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          ) : (
            renderCartButton()
          )}

            {/* Admin Link */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 transition-colors duration-300 ${
                    scrolled || !isHomePage
                      ? "text-foreground/70 hover:text-[#556B2F] hover:bg-[#556B2F]/10"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <User className={`w-4 h-4 ${
                    scrolled || !isHomePage ? "" : "drop-shadow-md"
                  }`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#FAF7F0] border-[#556B2F]/10">
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer text-[#556B2F]">
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/track-order" className="cursor-pointer text-[#556B2F]">
                    Track Order
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden h-8 w-8 transition-colors duration-300 ${
                scrolled || !isHomePage
                  ? "text-foreground/70 hover:text-[#556B2F] hover:bg-[#556B2F]/10"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              {isMenuOpen ? (
                <X className={`w-4 h-4 ${
                  scrolled || !isHomePage ? "" : "drop-shadow-md"
                }`} />
              ) : (
                <Menu className={`w-4 h-4 ${
                  scrolled || !isHomePage ? "" : "drop-shadow-md"
                }`} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass-card rounded-xl p-3 space-y-0.5">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white"
                    : "text-foreground/70 hover:bg-[#556B2F]/10 hover:text-[#556B2F]"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Language Selector */}
            <div className="flex items-center gap-1.5 px-3 py-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-300 ${
                    language === lang.code
                      ? "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white"
                      : "bg-[#556B2F]/10 text-[#556B2F] hover:bg-[#556B2F]/20"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
