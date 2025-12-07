"use client"

import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { ChevronDown, Star, SlidersHorizontal, Grid3X3, LayoutList, ArrowUpDown, Sparkles, Leaf, Package, TrendingUp, Award, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { productsApi, publicCategoriesApi, filesApi, type Product, type Category, getSmallestPrice, getPriceRange, getProductImageUrl } from "@/lib/api"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [sortBy, setSortBy] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch category info by slug
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setCategoryLoading(true)
        const data = await publicCategoriesApi.getBySlug(slug)
        setCategory(data)
      } catch (err) {
        console.error("Failed to fetch category:", err)
        // Try fallback - maybe slug doesn't exist, try by name pattern
        try {
          const allCategories = await publicCategoriesApi.getAll()
          const found = allCategories.find(c => 
            c.slug === slug || 
            c.name.toLowerCase() === slug.toLowerCase() ||
            c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
          )
          if (found) {
            setCategory(found)
          } else {
            setError("Category not found")
          }
        } catch {
          setError("Category not found")
        }
      } finally {
        setCategoryLoading(false)
      }
    }
    fetchCategory()
  }, [slug])

  // Fetch products when category is loaded
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return

      try {
        setLoading(true)
        setError(null)
        console.log("Fetching products for category:", category.id, "slug:", slug)
        const data = await productsApi.getByCategory(category.id)
        console.log("Received products data:", data)
        
        if (!data || !Array.isArray(data)) {
          console.error("Invalid data received:", data)
          setError("Invalid data received from server")
          setProducts([])
          return
        }
        
        setProducts(data)
        
        // Calculate max price from all products
        if (data.length > 0) {
          let highestPrice = 0
          data.forEach((product: Product) => {
            const range = getPriceRange(product)
            if (range.max > highestPrice) {
              highestPrice = range.max
            }
          })
          const roundedMax = Math.ceil(highestPrice / 100) * 100
          setMaxPrice(roundedMax || 1000)
          setPriceRange([0, roundedMax || 1000])
        }
        
        setError(null)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, slug])

  const filteredAndSortedProducts = useMemo(() => {
    console.log("Filtering products. Total products:", products.length, "Price range:", priceRange)
    
    // Filter by price using the smallest price from sizePrices
    let filtered = products.filter((p) => {
      const smallestPrice = getSmallestPrice(p)
      const inRange = smallestPrice >= priceRange[0] && smallestPrice <= priceRange[1]
      if (!inRange) {
        console.log(`Product ${p.name} (smallest price: ${smallestPrice}) filtered out by price range`)
      }
      return inRange
    })
    console.log("After price filter:", filtered.length)

    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => getSmallestPrice(a) - getSmallestPrice(b))
        break
      case "price-high":
        filtered = [...filtered].sort((a, b) => getSmallestPrice(b) - getSmallestPrice(a))
        break
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        break
      case "newest":
        filtered = [...filtered].reverse()
        break
      case "featured":
        // Featured products first
        filtered = [...filtered].sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        break
      case "all":
      default:
        // Keep original order - no sorting
        break
    }

    console.log("Final filtered products:", filtered.length)
    return filtered
  }, [products, priceRange, sortBy])

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
            <Link href="/">
              <Button className="btn-primary">Back to Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#faf9f6] via-white to-[#f8f6f1]">
      <Header />
      
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(5deg); }
          50% { transform: translate(-10px, -50px) rotate(-3deg); }
          75% { transform: translate(30px, -20px) rotate(7deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-25px, -40px) rotate(-5deg); }
          66% { transform: translate(15px, -25px) rotate(8deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10px, -20px) scale(1.1); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .float-slow { animation: float-slow 12s ease-in-out infinite; }
        .float-medium { animation: float-medium 8s ease-in-out infinite; }
        .float-fast { animation: float-fast 4s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #D6A64F 0%, #F4D03F 25%, #D6A64F 50%, #F4D03F 75%, #D6A64F 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* Category Hero - Enhanced Design */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/8 via-transparent to-[#D6A64F]/8" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D6A64F]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#556B2F]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          
          {/* Floating Gold Elements */}
          <div className="float-slow absolute top-20 left-[15%] w-4 h-4 rounded-full bg-gradient-to-br from-[#D6A64F] to-[#F4D03F] opacity-40 shadow-lg shadow-[#D6A64F]/30" />
          <div className="float-medium absolute top-32 right-[20%] w-6 h-6 rounded-full bg-gradient-to-br from-[#D6A64F] to-[#B8860B] opacity-30 shadow-lg shadow-[#D6A64F]/20" style={{ animationDelay: '-2s' }} />
          <div className="float-fast absolute top-48 left-[30%] w-3 h-3 rounded-full bg-[#D6A64F] opacity-50" style={{ animationDelay: '-1s' }} />
          <div className="float-slow absolute top-16 right-[35%] w-5 h-5 rounded-full bg-gradient-to-br from-[#F4D03F] to-[#D6A64F] opacity-35" style={{ animationDelay: '-4s' }} />
          
          {/* Floating Green Elements */}
          <div className="float-medium absolute top-40 left-[10%] w-5 h-5 rounded-full bg-gradient-to-br from-[#556B2F] to-[#6B8E23] opacity-30" style={{ animationDelay: '-3s' }} />
          <div className="float-slow absolute bottom-32 right-[15%] w-4 h-4 rounded-full bg-gradient-to-br from-[#6B8E23] to-[#556B2F] opacity-40" style={{ animationDelay: '-5s' }} />
          <div className="float-fast absolute top-60 right-[40%] w-3 h-3 rounded-full bg-[#556B2F] opacity-35" style={{ animationDelay: '-2s' }} />
          
          {/* Floating Diamond Shapes */}
          <div className="float-medium absolute top-28 left-[45%] w-4 h-4 rotate-45 bg-gradient-to-br from-[#D6A64F]/60 to-[#D6A64F]/20 opacity-50" style={{ animationDelay: '-1.5s' }} />
          <div className="float-slow absolute top-52 right-[25%] w-3 h-3 rotate-45 bg-gradient-to-br from-[#556B2F]/60 to-[#556B2F]/20 opacity-40" style={{ animationDelay: '-3.5s' }} />
          
          {/* Large Floating Rings */}
          <div className="float-slow absolute top-24 right-[10%] w-16 h-16 rounded-full border-2 border-[#D6A64F]/20 opacity-40" style={{ animationDelay: '-2.5s' }} />
          <div className="float-medium absolute bottom-20 left-[20%] w-12 h-12 rounded-full border-2 border-[#556B2F]/20 opacity-30" style={{ animationDelay: '-4.5s' }} />
        </div>
        <div className="moroccan-pattern opacity-[0.02]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-[#556B2F] transition-colors">Home</Link>
                <span>/</span>
                <span className="text-[#556B2F] font-medium">{category.name}</span>
              </nav>
              
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D6A64F]/10 text-[#D6A64F] text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Premium Collection
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2d3a1f] leading-tight">
                  {category.name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">{category.description || `Discover our premium ${category.name} collection from Beni Mellal.`}</p>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#556B2F]/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#556B2F]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#2d3a1f]">{products.length}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#D6A64F]/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#D6A64F]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#2d3a1f]">100%</p>
                    <p className="text-xs text-muted-foreground">Natural</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#556B2F]/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#556B2F]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#2d3a1f]">5★</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arabic Title Card - Enhanced Design */}
            <div className="hidden lg:block relative">
              {/* Glow effects */}
              <div className="pulse-glow absolute -inset-4 bg-gradient-to-br from-[#D6A64F]/30 to-[#556B2F]/20 rounded-[2rem] blur-2xl" />
              <div className="absolute -inset-1 bg-gradient-to-br from-[#D6A64F]/40 via-[#F4D03F]/20 to-[#556B2F]/30 rounded-3xl blur-xl" />
              
              {/* Main card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-[#FAF7F0]/90 to-white/70 backdrop-blur-md border border-[#D6A64F]/30 shadow-2xl">
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#D6A64F]/20 to-transparent rounded-br-full" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#556B2F]/20 to-transparent rounded-tl-full" />
                
                {/* Floating decorative dots */}
                <div className="float-fast absolute top-4 right-8 w-2 h-2 rounded-full bg-[#D6A64F]/50" />
                <div className="float-medium absolute bottom-6 left-6 w-3 h-3 rounded-full bg-[#556B2F]/40" style={{ animationDelay: '-1s' }} />
                
                <div className="relative px-10 py-10">
                  {/* Top decorative line */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#D6A64F]/50 to-[#D6A64F]" />
                    <div className="w-3 h-3 rotate-45 bg-gradient-to-br from-[#D6A64F] to-[#F4D03F] shadow-md" />
                    <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#D6A64F]/50 to-[#D6A64F]" />
                  </div>
                  
                  {/* Arabic Title with shimmer effect */}
                  <p className="shimmer-text text-5xl font-arabic leading-relaxed text-center font-bold">
                    {category.nameAr || category.name}
                  </p>
                  
                  {/* Subtitle */}
                  <p className="text-center text-sm text-[#556B2F]/70 mt-3 font-medium tracking-wide">
                    ✦ PREMIUM QUALITY ✦
                  </p>
                  
                  {/* Bottom decorative element */}
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#556B2F]/40" />
                    <Leaf className="w-5 h-5 text-[#556B2F]/60" />
                    <div className="w-2 h-2 rounded-full bg-[#D6A64F]/60" />
                    <Leaf className="w-5 h-5 text-[#556B2F]/60 scale-x-[-1]" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#556B2F]/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Filters - Desktop */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Filter Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e9e6dd]">
                  <h3 className="font-serif font-semibold mb-6 text-lg flex items-center gap-2 text-[#2d3a1f]">
                    <SlidersHorizontal className="w-4 h-4 text-[#556B2F]" />
                    Filters
                  </h3>

                  {/* Price Filter */}
                  <div className="space-y-4 mb-8">
                    <h4 className="text-sm font-medium text-[#2d3a1f]">Price Range</h4>
                    <div className="pt-2 pb-4">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={maxPrice}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-2 rounded-lg bg-[#556B2F]/10 text-sm font-semibold text-[#556B2F]">
                        {priceRange[0]} MAD
                      </div>
                      <span className="text-muted-foreground text-sm">—</span>
                      <div className="px-3 py-2 rounded-lg bg-[#D6A64F]/10 text-sm font-semibold text-[#D6A64F]">
                        {priceRange[1]} MAD
                      </div>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-[#2d3a1f]">Sort By</h4>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full bg-[#f8f6f1] border-[#e9e6dd] focus:ring-[#556B2F] focus:border-[#556B2F]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#e9e6dd]">
                        <SelectItem value="all">📋 All Products</SelectItem>
                        <SelectItem value="featured">⭐ Featured</SelectItem>
                        <SelectItem value="price-low">↑ Price: Low to High</SelectItem>
                        <SelectItem value="price-high">↓ Price: High to Low</SelectItem>
                        <SelectItem value="name">🔤 Name A-Z</SelectItem>
                        <SelectItem value="newest">🆕 Newest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset */}
                  <Button
                    variant="outline"
                    className="w-full mt-6 border-[#556B2F]/30 text-[#556B2F] hover:bg-[#556B2F] hover:text-white transition-colors"
                    onClick={() => {
                      setPriceRange([0, maxPrice])
                      setSortBy("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
                
                {/* Trust Badge Card */}
                <div className="bg-gradient-to-br from-[#556B2F]/5 to-[#D6A64F]/5 rounded-2xl p-5 border border-[#e9e6dd]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#556B2F] flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2d3a1f]">100% Natural</p>
                      <p className="text-xs text-muted-foreground">No preservatives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D6A64F] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2d3a1f]">Direct Source</p>
                      <p className="text-xs text-muted-foreground">From Beni Mellal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Trigger */}
            <div className="lg:hidden flex items-center justify-between gap-3 mb-4 p-4 bg-white rounded-xl border border-[#e9e6dd]">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 border-[#556B2F]/30 text-[#556B2F]">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters & Sort
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-white border-r border-[#e9e6dd]">
                  <SheetHeader>
                    <SheetTitle className="font-serif text-[#2d3a1f]">Filters</SheetTitle>
                    <SheetDescription>Refine your search</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    {/* Price Filter */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-[#2d3a1f]">Price Range</h4>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={maxPrice}
                        min={0}
                        step={10}
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#556B2F]">{priceRange[0]} MAD</span>
                        <span className="text-muted-foreground">to</span>
                        <span className="font-medium text-[#D6A64F]">{priceRange[1]} MAD</span>
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-[#2d3a1f]">Sort By</h4>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">📋 All Products</SelectItem>
                          <SelectItem value="featured">⭐ Featured</SelectItem>
                          <SelectItem value="price-low">↑ Price: Low to High</SelectItem>
                          <SelectItem value="price-high">↓ Price: High to Low</SelectItem>
                          <SelectItem value="name">🔤 Name A-Z</SelectItem>
                          <SelectItem value="newest">🆕 Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full border-[#556B2F]/30 text-[#556B2F]"
                      onClick={() => {
                        setPriceRange([0, maxPrice])
                        setSortBy("all")
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-[#556B2F] hover:bg-[#4a5f29]" : "border-[#e9e6dd]"}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-[#556B2F] hover:bg-[#4a5f29]" : "border-[#e9e6dd]"}
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-4">
              {/* Results Count & View Toggle */}
              <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl border border-[#e9e6dd]">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-[#2d3a1f]">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#556B2F]/30 border-t-[#556B2F] rounded-full animate-spin" />
                        Loading products...
                      </span>
                    ) : (
                      <>
                        <span className="text-[#D6A64F] font-bold">{filteredAndSortedProducts.length}</span>
                        {" "}product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
                      </>
                    )}
                  </p>
                  {!loading && !error && products.length > 0 && filteredAndSortedProducts.length < products.length && (
                    <p className="text-xs text-muted-foreground">
                      Filtered from {products.length} total products
                    </p>
                  )}
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">View:</span>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-[#556B2F] hover:bg-[#4a5f29]" : "border-[#e9e6dd]"}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-[#556B2F] hover:bg-[#4a5f29]" : "border-[#e9e6dd]"}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e9e6dd] animate-pulse">
                      <div className={viewMode === "grid" ? "h-64 bg-gradient-to-br from-[#f8f6f1] to-[#ede9e0]" : "h-32 w-32 bg-gradient-to-br from-[#f8f6f1] to-[#ede9e0]"} />
                      <div className="p-5 space-y-3">
                        <div className="h-3 w-20 bg-[#e9e6dd] rounded-full" />
                        <div className="h-5 w-full bg-[#e9e6dd] rounded-full" />
                        <div className="h-4 w-24 bg-[#e9e6dd] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-[#e9e6dd] shadow-sm">
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⚠️</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2 text-[#2d3a1f]">Error Loading Products</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
                  <Button 
                    className="bg-[#556B2F] hover:bg-[#4a5f29] text-white"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredAndSortedProducts.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                  {filteredAndSortedProducts.map((product, index) => {
                    const priceRange = getPriceRange(product);
                    const smallestPrice = getSmallestPrice(product);
                    
                    return viewMode === "grid" ? (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group"
                      >
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                          {/* Image Container */}
                          <div className="relative overflow-hidden h-64 bg-gradient-to-br from-[#f8f6f1] to-[#ede9e0]">
                            <img
                              src={getProductImageUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* Featured Badge */}
                            {product.featured && (
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D6A64F] to-[#E8B960] text-white text-xs font-semibold shadow-lg">
                                <Sparkles className="w-3 h-3" />
                                Featured
                              </div>
                            )}
                            
                            {/* Quick View Hint */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm text-[#556B2F] text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                              View Sizes & Prices
                            </div>
                            
                            {/* Natural Badge */}
                            <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                              <Leaf className="w-5 h-5 text-[#556B2F]" />
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="p-5">
                            {/* Category Tag */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] uppercase tracking-widest text-[#D6A64F] font-semibold">
                                {product.category.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60">•</span>
                              <span className="text-[10px] text-muted-foreground/80 font-arabic">
                                {product.nameAr}
                              </span>
                            </div>
                            
                            {/* Product Name */}
                            <h3 className="font-serif text-lg font-semibold text-[#2d3a1f] mb-3 line-clamp-2 group-hover:text-[#556B2F] transition-colors">
                              {product.name}
                            </h3>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-[#D6A64F] text-[#D6A64F]" />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">(5.0)</span>
                            </div>
                            
                            {/* Price Section */}
                            <div className="flex items-end justify-between pt-3 border-t border-[#e9e6dd]">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                                  Starting from
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-2xl font-serif font-bold text-[#D6A64F]">
                                    {smallestPrice.toFixed(0)}
                                  </span>
                                  <span className="text-sm text-[#D6A64F]/70">MAD</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs font-medium group-hover:bg-[#556B2F] group-hover:text-white transition-colors">
                                Choose Size
                                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Card
                        key={product.id}
                        className="glass-card overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <Link href={`/product/${product.id}`} className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden">
                            <img
                              src={getProductImageUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {product.featured && (
                              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#D6A64F] to-[#E8B960] text-white text-xs font-medium">
                                <Sparkles className="w-3 h-3" />
                                Featured
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase tracking-widest text-[#D6A64F] font-semibold">
                                  {product.category.name}
                                </span>
                              </div>
                              <Link href={`/product/${product.id}`}>
                                <h3 className="font-serif text-xl font-semibold hover:text-[#556B2F] transition-colors mb-1">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground/70 font-arabic mb-2">{product.nameAr}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#556B2F]/10">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  Price range
                                </span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-serif font-bold text-[#D6A64F]">
                                    {priceRange.min.toFixed(0)} - {priceRange.max.toFixed(0)}
                                  </span>
                                  <span className="text-sm text-[#D6A64F]/70">MAD</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-[#D6A64F] text-[#D6A64F]" />
                                  ))}
                                </div>
                                <Link href={`/product/${product.id}`}>
                                  <Button className="btn-primary">
                                    Select Size
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-[#e9e6dd] shadow-sm">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#556B2F]/10 to-[#D6A64F]/10 flex items-center justify-center mx-auto mb-6">
                    <SlidersHorizontal className="w-10 h-10 text-[#556B2F]/50" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2 text-[#2d3a1f]">
                    {products.length === 0 ? "No Products Available" : "No Products Match"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {products.length === 0 
                      ? "There are no products in this category yet. Please check back later."
                      : `No products match the price range ${priceRange[0]} - ${priceRange[1]} MAD. Try adjusting your filters.`
                    }
                  </p>
                  {products.length > 0 && (
                    <Button
                      className="bg-[#556B2F] hover:bg-[#4a5f29] text-white"
                      onClick={() => {
                        setPriceRange([0, maxPrice])
                        setSortBy("featured")
                      }}
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
