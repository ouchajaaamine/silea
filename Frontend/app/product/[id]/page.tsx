"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { ShoppingCart, ChevronRight, ChevronLeft, Star, Minus, Plus, Truck, Shield, Leaf, Check, Crown, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { productsApi, filesApi, type Product, type ProductImage, type ProductSize, getSizesForCategory, getPriceForSize, getProductImageUrl, getLocalizedDescription } from "@/lib/api"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import { useTranslation } from "@/lib/translation-context"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t, language } = useTranslation()
  const [product, setProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([])
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const { addItem, getItemQuantity } = useCart()

  const itemInCart = product && selectedSize ? getItemQuantity(product.id, selectedSize.code) : 0
  const currentPrice = product && selectedSize ? getPriceForSize(product, selectedSize.code) : 0

  // Get current image URL - prefer images array, fallback to product.imageUrl
  const getCurrentImageUrl = () => {
    if (productImages.length > 0 && productImages[selectedImage]) {
      return filesApi.getImageUrl(productImages[selectedImage].imageUrl)
    }
    return product?.imageUrl ? filesApi.getImageUrl(product.imageUrl) : "/placeholder.svg"
  }

  // Navigate between images
  const navigateImage = (direction: 'prev' | 'next') => {
    const totalImages = productImages.length || 1
    if (direction === 'prev') {
      setSelectedImage(prev => prev === 0 ? totalImages - 1 : prev - 1)
    } else {
      setSelectedImage(prev => prev === totalImages - 1 ? 0 : prev + 1)
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await productsApi.getById(Number(id))
        setProduct(data)

        // Fetch product images
        try {
          const images = await productsApi.getImages(Number(id))
          setProductImages(images)
        } catch (imgErr) {
          console.log("No additional images found")
          setProductImages([])
        }

        // Set available sizes based on category
        const sizes = getSizesForCategory(data.category?.name || 'honey')
        setAvailableSizes(sizes)
        setSelectedSize(sizes[0]) // Default to first (largest) size

        // Fetch related products from same category
        if (data.category?.id) {
          const categoryProducts = await productsApi.getByCategory(data.category.id)
          setRelatedProducts(categoryProducts.filter((p) => p.id !== data.id).slice(0, 4))
        }

        setError(null)
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Failed to load product")
        // Fallback data
        const fallbackProduct = {
          id: Number(id),
          name: "Thyme Honey",
          nameAr: "عسل الزعتر الخالص",
          price: 350, // Base price for 1kg
          available: true,
          imageUrl: "/moroccan-thyme-honey-jar-premium.jpg",
          status: "ACTIVE" as const,
          featured: true,
          description:
            "Pure, organic thyme honey sourced directly from the mountains of Beni Mellal. Harvested using traditional methods and carefully preserved to maintain all natural qualities. Our thyme honey is known for its unique flavor profile and numerous health benefits.",
          category: { id: 2, name: "Honey", nameAr: "العسل" },
          createdAt: "",
          updatedAt: "",
        }
        setProduct(fallbackProduct)
        
        const sizes = getSizesForCategory('honey')
        setAvailableSizes(sizes)
        setSelectedSize(sizes[0])
        
        setRelatedProducts([
          {
            id: 3,
            name: "Wildflower Honey",
            nameAr: "عسل الأزهار البرية",
            price: 320,
            imageUrl: "/moroccan-wildflower-honey-authentic.jpg",
            available: true,
            status: "ACTIVE" as const,
            featured: true,
            description: "",
            category: { id: 2, name: "Honey" },
            createdAt: "",
            updatedAt: "",
          },
          {
            id: 5,
            name: "Eucalyptus Honey",
            nameAr: "عسل الكاليبتوس",
            price: 420,
            imageUrl: "/moroccan-eucalyptus-honey-beni-mellal.jpg",
            available: true,
            status: "ACTIVE" as const,
            featured: false,
            description: "",
            category: { id: 2, name: "Honey" },
            createdAt: "",
            updatedAt: "",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addItem(product, selectedSize, quantity)
      toast.success(`${product.name} added to cart`, {
        description: `${quantity} × ${selectedSize.displayName} = ${(currentPrice * quantity).toFixed(2)} MAD`,
        duration: 1000,
        className: 'animate-in slide-in-from-top-2 fade-in zoom-in-95',
      })
    }
  }

  const benefits = [
    t.product.benefitsList.antioxidants,
    t.product.benefitsList.energy,
    t.product.benefitsList.respiratory,
    t.product.benefitsList.digestion,
    t.product.benefitsList.antibacterial,
  ]

  const reviews = [
    {
      author: "Laila M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Absolutely delicious! The flavor is rich and complex. This is what real honey tastes like.",
    },
    {
      author: "Hassan K.",
      rating: 5,
      date: "1 month ago",
      text: "Quality is unmatched. I use it daily and can feel the benefits.",
    },
    {
      author: "Zainab A.",
      rating: 4,
      date: "2 months ago",
      text: "Excellent product. Better than anything I've tried before. Will definitely order again.",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="py-32 px-4 sm:px-6 lg:px-8 flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Skeleton className="aspect-square rounded-3xl" />
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <Skeleton className="w-20 h-20 rounded-xl" />
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold mb-4">{t.product.productNotFound}</h1>
            <p className="text-muted-foreground mb-6">
              {t.product.productNotFoundDesc}
            </p>
            <Link href="/">
              <Button className="btn-primary">{t.product.backToHome}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8 border-b border-[#556B2F]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-[#556B2F] transition-colors">
              {t.product.categoryBreadcrumb}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/category/${product.category.slug || product.category.name.toLowerCase()}`}
              className="hover:text-[#556B2F] transition-colors"
            >
              {language === 'ar' && product.category.nameAr ? product.category.nameAr : product.category.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Images with Zoom */}
            <div className="space-y-4">
              {/* Main Image with Zoom Effect */}
              <div 
                className="relative aspect-square rounded-3xl overflow-hidden bg-muted glass-card cursor-zoom-in group"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  setZoomPosition({ x, y })
                }}
              >
                {/* Normal Image */}
                <img
                  src={getCurrentImageUrl()}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
                />
                {/* Zoomed Image */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${isZoomed ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    backgroundImage: `url(${getCurrentImageUrl()})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '200%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                
                {/* Image Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                    {selectedImage + 1} / {productImages.length}
                  </div>
                )}
                
                {/* Primary Badge for images */}
                {productImages.length > 0 && productImages[selectedImage]?.isPrimary && (
                  <div className="absolute top-4 left-4 bg-[#D6A64F] text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 z-10">
                    <Crown className="w-3.5 h-3.5" />
                    {t.product.primary}
                  </div>
                )}
                
                {/* Zoom hint */}
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium transition-all duration-300 ${isZoomed ? 'opacity-0' : 'opacity-100 group-hover:opacity-100'} ${productImages.length > 1 ? 'hidden' : ''} opacity-0`}>
                  Hover to zoom
                </div>
                {/* Magnifier indicator */}
                <div className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 ${isZoomed ? 'scale-110' : ''} z-10`}>
                  <svg className="w-5 h-5 text-[#556B2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tracking-[0.2em] uppercase text-[#D6A64F]">
                  {product.category.name}
                </span>
                {product.featured && (
                  <Badge className="bg-[#556B2F] text-white">{t.product.featured}</Badge>
                )}
                {!product.available && (
                  <Badge variant="outline" className="border-red-500 text-red-500">
                    {t.product.unavailable}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{product.name}</h1>
                <p className="text-xl text-muted-foreground">{product.nameAr}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 pb-6 border-b border-[#556B2F]/10">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#D6A64F] text-[#D6A64F]" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{t.product.rating}</span>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">{t.product.selectSize}</label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map((size) => (
                    <button
                      key={size.code}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        selectedSize?.code === size.code
                          ? "border-[#556B2F] bg-[#556B2F]/10 text-[#556B2F]"
                          : "border-[#556B2F]/20 hover:border-[#556B2F]/40"
                      }`}
                    >
                      <span className="font-medium">{size.displayName}</span>
                      <span className="block text-sm text-muted-foreground">
                        {getPriceForSize(product, size.code).toFixed(2)} MAD
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-serif font-bold text-[#D6A64F]">
                  {currentPrice.toFixed(2)} MAD
                </span>
              </div>

              {/* Availability */}
              <p className="text-muted-foreground">
                {selectedSize?.displayName} • {product.available ? t.common.inStock : t.product.unavailableStatus}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 hover:bg-[#556B2F]/10 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 font-medium min-w-[60px] text-center border-x border-[#556B2F]/10">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 hover:bg-[#556B2F]/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <Button 
                    className="flex-1 btn-primary h-14 text-base" 
                    onClick={handleAddToCart}
                    disabled={!product.available || !selectedSize}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {t.common.addToCart}
                    {itemInCart > 0 && (
                      <Badge className="ml-2 bg-white/20">{itemInCart} {t.product.inCart}</Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#556B2F]/10">
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#556B2F]/5">
                  <Truck className="w-5 h-5 text-[#556B2F] mb-2" />
                  <span className="text-xs text-muted-foreground">24-72h</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#556B2F]/5">
                  <Shield className="w-5 h-5 text-[#556B2F] mb-2" />
                  <span className="text-xs text-muted-foreground">{t.product.securePayment}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#556B2F]/5">
                  <Leaf className="w-5 h-5 text-[#556B2F] mb-2" />
                  <span className="text-xs text-muted-foreground">{t.product.natural}</span>
                </div>
              </div>
              
              {/* Oil Products - Delivery Cities Notice */}
              {(product.category.name.toLowerCase().includes('oil') || 
                product.category.name.toLowerCase().includes('huile') || 
                product.category.name.toLowerCase().includes('زيت')) && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <span className="text-amber-900">
                      <span className="font-medium">
                        {language === 'ar' ? 'التوصيل:' : language === 'fr' ? 'Livraison:' : 'Delivery:'}
                      </span> 
                      {language === 'ar' ? 'طنجة • الدار البيضاء • بني ملال • المحمدية' : 
                       'Tanger • Casablanca • Beni Mellal • Mohammedia'}
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-semibold">30 MAD</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-16">
            <TabsList className="glass-card p-1 h-auto">
              <TabsTrigger
                value="description"
                className="px-6 py-3 data-[state=active]:bg-[#556B2F] data-[state=active]:text-white rounded-lg"
              >
                {t.product.description}
              </TabsTrigger>
              <TabsTrigger
                value="benefits"
                className="px-6 py-3 data-[state=active]:bg-[#556B2F] data-[state=active]:text-white rounded-lg"
              >
                {t.product.benefits}
              </TabsTrigger>
              {/* <TabsTrigger
                value="reviews"
                className="px-6 py-3 data-[state=active]:bg-[#556B2F] data-[state=active]:text-white rounded-lg"
              >
                {t.product.reviews} {t.product.reviewsCount}
              </TabsTrigger> */}
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <Card className="glass-card border-2 border-[#556B2F]/10 overflow-hidden">
                <div className="bg-gradient-to-r from-[#556B2F]/10 via-[#6B8E23]/5 to-transparent p-8 border-b border-[#556B2F]/10">
                  <h3 className="font-serif text-3xl font-bold text-[#556B2F] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#556B2F]/10 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-[#556B2F]" />
                    </div>
                    {t.product.aboutProduct}
                  </h3>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D6A64F] via-[#556B2F] to-[#D6A64F] rounded-full" />
                    <p className={`text-lg leading-relaxed pl-4 ${language === 'ar' ? 'font-arabic text-right' : ''}`} style={{ lineHeight: '2' }}>
                      {getLocalizedDescription(product, language)}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#556B2F]/10 to-[#6B8E23]/5 border border-[#556B2F]/20 hover:border-[#556B2F]/40 transition-all duration-300 hover:shadow-lg">
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#D6A64F]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Leaf className="w-5 h-5 text-[#D6A64F]" />
                      </div>
                      <p className="text-xs uppercase tracking-wider text-[#556B2F] font-semibold mb-2">{t.product.origin}</p>
                      <p className="font-bold text-lg">{t.product.benimelalMountains}</p>
                    </div>
                    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-[#D6A64F]/10 to-[#F4D03F]/5 border border-[#D6A64F]/20 hover:border-[#D6A64F]/40 transition-all duration-300 hover:shadow-lg">
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#556B2F]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5 text-[#556B2F]" />
                      </div>
                      <p className="text-xs uppercase tracking-wider text-[#D6A64F] font-semibold mb-2">{t.product.ingredients}</p>
                      <p className="font-bold text-lg">{t.product.pureNoAdditives}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="mt-8">
              <Card className="glass-card p-8">
                <CardContent className="p-0">
                  <h3 className="font-serif text-2xl font-bold mb-6">{t.product.healthBenefits}</h3>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#556B2F] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews - Will add later */}
            {/* <TabsContent value="reviews" className="mt-8">
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <Card key={i} className="glass-card p-6">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#556B2F] to-[#6B8E23] flex items-center justify-center">
                            <span className="text-white font-medium">{review.author.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="w-4 h-4 fill-[#D6A64F] text-[#D6A64F]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="btn-secondary w-full">
                  {t.product.viewAllReviews}
                </Button>
              </div>
            </TabsContent> */}
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 premium-section">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-8">{t.product.youMightAlsoLike}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                  className="product-card overflow-hidden"
                >
                  <div className="relative h-48 bg-muted overflow-hidden group">
                    <img
                      src={getProductImageUrl(relatedProduct)}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif font-semibold mb-2 line-clamp-1">{relatedProduct.name}</h3>
                    <p className="text-[#D6A64F] font-bold">{relatedProduct.price} MAD</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
