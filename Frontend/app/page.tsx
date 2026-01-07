"use client"

// Updated for EC2 t4g.small deployment
import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Leaf, Heart, Star, Shield, Play, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { productsApi, filesApi, publicCategoriesApi, type Product, type Category, getSmallestPrice, getPriceRange, getProductImageUrl } from "@/lib/api"
import { useTranslation } from "@/lib/translation-context"
import { useCategoryDialog } from "@/lib/category-dialog-context"

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: -1,
    name: "Honey",
    nameAr: "العسل",
    description: "Pure, golden honey crafted by Beni Mellal families.",
    slug: "honey",
    imageUrl: "/moroccan-thyme-honey-jar-premium.jpg",
    active: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: -2,
    name: "Oils",
    nameAr: "الزيوت",
    description: "Traditional mountain oils pressed with patience.",
    slug: "oils",
    imageUrl: "/premium-moroccan-olive-oil-bottle.jpg",
    active: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
]

export default function Home() {
  const { t, language } = useTranslation()
  const { openDialog } = useCategoryDialog()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch both products and categories in parallel
        const [featuredProducts, activeCategories] = await Promise.all([
          productsApi.getFeatured(),
          publicCategoriesApi.getAll()
        ])
        setProducts(featuredProducts)
        setCategories(activeCategories)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load data")
        // Fallback to demo data
        setProducts([
          {
            id: 1,
            name: "Thyme Honey",
            nameAr: "عسل الزعتر",
            price: 35,
            imageUrl: "/moroccan-thyme-honey-jar-premium.jpg",
            category: { id: 2, name: "Honey", nameAr: "العسل" },
            available: true,
            status: "ACTIVE",
            featured: true,
            description: "",
            createdAt: "",
            updatedAt: "",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const effectiveCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <style>{`@keyframes popIn {
      0% { opacity: 0; transform: translateY(12px) scale(.99); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .pop-in { animation: popIn 520ms cubic-bezier(.2,.8,.2,1) both; }
    .product-card-hover { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .product-card-hover:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 20px 40px -12px rgba(214,166,79,0.35), 0 0 0 2px rgba(214,166,79,0.15); }
    .product-card-hover:hover .card-glow { opacity: 1; }
    .product-card-hover:hover .card-image { transform: scale(1.08); filter: brightness(0.92); }
    .product-card-hover:hover .card-overlay { opacity: 1; backdrop-filter: blur(2px); }
    .product-card-hover:hover .card-info { background: rgba(255,255,255,0.98); }
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
    .float-slow-hero { animation: float-slow 12s ease-in-out infinite; }
    .float-medium-hero { animation: float-medium 8s ease-in-out infinite; }
    .float-fast-hero { animation: float-fast 4s ease-in-out infinite; }
    .pulse-glow-hero { animation: pulse-glow 3s ease-in-out infinite; }
    `}</style>

      {/* Hero Section with Video Background */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/placeholder.svg?height=1080&width=1920&query=olive trees beni mellal mountains morocco"
        >
          <source src="/background.mp4" type="video/mp4" />
          {/* Fallback image if video doesn't load */}
        </video>
        
        {/* Dark Overlay - Slightly darker */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-5 mt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-card-dark px-5 py-2.5 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Leaf className="w-4 h-4 text-[#D6A64F]" />
            <span className="text-sm font-medium tracking-wide">{t.home.hero.title}</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            Silea
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl lg:text-3xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            {t.home.hero.subtitle}
          </p>

          {/* CTA Button - Simple & Elegant */}
          <div className="flex justify-center pt-8 mb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-450">
            <Button 
              onClick={openDialog}
              className="bg-[#556B2F] hover:bg-[#D6A64F] text-white font-semibold text-base px-10 py-6 rounded-full transition-all duration-300 hover:shadow-lg group"
            >
              {t.home.hero.cta}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Scroll Indicator with Text */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-in fade-in duration-1000 delay-700">
          <p className="text-sm text-white/60 font-light tracking-wide">{t.home.hero.scrollDown}</p>
          <div className="animate-bounce">
            <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FBF8F3] via-[#F8F4ED] to-[#FFF8E7] relative overflow-hidden">
        {/* Floating Elements for Categories Section */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large glowing orbs */}
          <div className="pulse-glow-hero absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-[#D6A64F]/10 to-[#F4D03F]/5 blur-3xl" />
          <div className="pulse-glow-hero absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gradient-to-br from-[#556B2F]/8 to-[#6B8E23]/5 blur-3xl" style={{ animationDelay: '1.5s' }} />
          
          {/* Floating gold particles */}
          <div className="float-slow-hero absolute top-[10%] right-[15%] w-5 h-5 rounded-full bg-gradient-to-br from-[#D6A64F] to-[#F4D03F] opacity-50 shadow-lg shadow-[#D6A64F]/30" />
          <div className="float-medium-hero absolute top-[30%] left-[8%] w-4 h-4 rounded-full bg-gradient-to-br from-[#F4D03F] to-[#D6A64F] opacity-40" style={{ animationDelay: '-2s' }} />
          <div className="float-fast-hero absolute bottom-[25%] right-[10%] w-3 h-3 rounded-full bg-[#D6A64F] opacity-60" style={{ animationDelay: '-1s' }} />
          <div className="float-slow-hero absolute bottom-[40%] left-[5%] w-6 h-6 rounded-full bg-gradient-to-br from-[#D6A64F]/80 to-[#B8860B]/60 opacity-35" style={{ animationDelay: '-3s' }} />
          
          {/* Floating green particles */}
          <div className="float-medium-hero absolute top-[20%] left-[20%] w-4 h-4 rounded-full bg-gradient-to-br from-[#556B2F] to-[#6B8E23] opacity-40" style={{ animationDelay: '-1.5s' }} />
          <div className="float-slow-hero absolute bottom-[15%] right-[25%] w-5 h-5 rounded-full bg-gradient-to-br from-[#6B8E23] to-[#556B2F] opacity-35" style={{ animationDelay: '-4s' }} />
          
          {/* Diamond shapes */}
          <div className="float-medium-hero absolute top-[15%] left-[40%] w-4 h-4 rotate-45 bg-gradient-to-br from-[#D6A64F] to-transparent opacity-50" style={{ animationDelay: '-2.5s' }} />
          <div className="float-slow-hero absolute bottom-[30%] right-[35%] w-3 h-3 rotate-45 bg-gradient-to-br from-[#556B2F] to-transparent opacity-40" style={{ animationDelay: '-1s' }} />
          
          {/* Floating rings */}
          <div className="float-slow-hero absolute top-[25%] right-[5%] w-20 h-20 rounded-full border-2 border-[#D6A64F]/25 opacity-40" style={{ animationDelay: '-3s' }} />
          <div className="float-medium-hero absolute bottom-[20%] left-[12%] w-16 h-16 rounded-full border-2 border-[#556B2F]/20 opacity-35" style={{ animationDelay: '-2s' }} />
          
          {/* Star shapes */}
          <div className="float-fast-hero absolute top-[45%] right-[8%] opacity-40" style={{ animationDelay: '-0.5s' }}>
            <svg className="w-6 h-6 text-[#D6A64F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
            </svg>
          </div>
          <div className="float-slow-hero absolute bottom-[35%] left-[18%] opacity-30" style={{ animationDelay: '-4s' }}>
            <svg className="w-5 h-5 text-[#556B2F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
            </svg>
          </div>
          
          {/* Hexagon shapes */}
          <div className="float-medium-hero absolute top-[60%] left-[3%] w-8 h-8 opacity-30" style={{ animationDelay: '-2s' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#D6A64F" strokeWidth="1.5">
              <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z"/>
            </svg>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="inline-block text-sm font-semibold uppercase text-[#D6A64F] mb-4">
              {t.home.categories.title}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-balance">
              {t.home.categories.subtitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.home.featured.subtitle}
            </p>
          </div>

          {/* Category Cards - Dynamic */}
          <div className={`grid gap-8 mb-16 ${categories.length === 1 ? 'md:grid-cols-1 max-w-2xl mx-auto' : categories.length === 2 ? 'md:grid-cols-2' : categories.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
            {categories.length > 0 ? (
              categories.map((category, index) => {
                // Default images based on category name keywords
                const getDefaultImage = (name: string) => {
                  const lowerName = name.toLowerCase()
                  if (lowerName.includes('honey') || lowerName.includes('عسل') || lowerName.includes('miel')) {
                    return '/moroccan-thyme-honey-jar-premium.jpg'
                  }
                  if (lowerName.includes('oil') || lowerName.includes('زيت') || lowerName.includes('huile')) {
                    return '/premium-moroccan-olive-oil-bottle.jpg'
                  }
                  if (lowerName.includes('amlou') || lowerName.includes('املو')) {
                    return '/moroccan-amlou-spread.jpg'
                  }
                  return '/placeholder-category.jpg'
                }
                
                const categoryImage = category.imageUrl 
                  ? filesApi.getImageUrl(category.imageUrl)
                  : getDefaultImage(category.name)
                
                const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
                
                // Alternate icons
                const icons = [Leaf, Shield, Heart, Star]
                const IconComponent = icons[index % icons.length]
                const taglines = [
                  t.home.features.natural.title,
                  t.home.features.coldPressed.title,
                  t.home.features.traditional.title,
                  t.home.features.premium.title,
                ]
                const tagline = taglines[index % taglines.length]
                
                return (
                  <Link
                    key={category.id}
                    href={`/category/${categorySlug}`}
                    className="group relative overflow-hidden rounded-3xl h-[500px] transition-all duration-700 hover:shadow-2xl hover:shadow-[#D6A64F]/20"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${categoryImage})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-10">
                      <span className="inline-flex items-center gap-2 text-[#D6A64F] text-sm font-medium tracking-wide mb-3">
                        <IconComponent className="w-4 h-4" />
                        {tagline}
                      </span>
                      <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                        {language === 'ar' && category.nameAr ? category.nameAr : category.name}
                      </h3>
                      <p className="text-white/60 text-lg font-arabic mb-4">
                        {language === 'ar' ? category.name : category.nameAr}
                      </p>
                      <p className="text-white/80 mb-6 text-lg max-w-md line-clamp-2">
                        {category.description || `${t.home.categories.explore} ${category.name.toLowerCase()}`}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[#D6A64F] font-semibold text-lg group-hover:gap-4 transition-all duration-300">
                        {t.home.categories.explore}
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </Link>
                )
              })
            ) : (
              // Fallback skeleton while loading
              <>
                <div className="rounded-3xl h-[500px] bg-muted animate-pulse" />
                <div className="rounded-3xl h-[500px] bg-muted animate-pulse" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Purity Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F5F8F0] via-[#FAFCF7] to-[#F0F5E8] relative overflow-hidden">
        {/* Floating Elements for Purity Section */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Organic blob shapes */}
          <div className="pulse-glow-hero absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#556B2F]/8 via-[#6B8E23]/5 to-transparent blur-3xl" />
          <div className="pulse-glow-hero absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#D6A64F]/10 via-[#F4D03F]/5 to-transparent blur-3xl" style={{ animationDelay: '2s' }} />
          
          {/* Floating leaf-like elements */}
          <div className="float-slow-hero absolute top-[15%] right-[10%] w-8 h-8 opacity-30" style={{ animationDelay: '-1s' }}>
            <svg viewBox="0 0 24 24" fill="#556B2F">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </div>
          <div className="float-medium-hero absolute bottom-[20%] left-[8%] w-6 h-6 opacity-25 rotate-45" style={{ animationDelay: '-3s' }}>
            <svg viewBox="0 0 24 24" fill="#D6A64F">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
            </svg>
          </div>
          
          {/* Floating dots pattern */}
          <div className="float-fast-hero absolute top-[30%] left-[15%] w-3 h-3 rounded-full bg-[#D6A64F] opacity-50" style={{ animationDelay: '-0.5s' }} />
          <div className="float-slow-hero absolute top-[25%] left-[25%] w-2 h-2 rounded-full bg-[#556B2F] opacity-40" style={{ animationDelay: '-2s' }} />
          <div className="float-medium-hero absolute top-[40%] right-[20%] w-4 h-4 rounded-full bg-gradient-to-br from-[#D6A64F] to-[#F4D03F] opacity-35" style={{ animationDelay: '-1.5s' }} />
          <div className="float-fast-hero absolute bottom-[35%] right-[15%] w-3 h-3 rounded-full bg-[#6B8E23] opacity-45" style={{ animationDelay: '-1s' }} />
          <div className="float-slow-hero absolute bottom-[25%] left-[30%] w-5 h-5 rounded-full bg-gradient-to-br from-[#556B2F]/70 to-[#556B2F]/30 opacity-40" style={{ animationDelay: '-4s' }} />
          
          {/* Plus signs */}
          <div className="float-medium-hero absolute top-[20%] right-[30%] text-[#D6A64F]/30 text-2xl font-light" style={{ animationDelay: '-2s' }}>+</div>
          <div className="float-slow-hero absolute bottom-[40%] left-[5%] text-[#556B2F]/25 text-3xl font-light" style={{ animationDelay: '-3.5s' }}>+</div>
          
          {/* Circles with borders */}
          <div className="float-slow-hero absolute top-[50%] right-[5%] w-12 h-12 rounded-full border border-[#D6A64F]/20 opacity-50" style={{ animationDelay: '-2.5s' }} />
          <div className="float-medium-hero absolute bottom-[15%] left-[20%] w-8 h-8 rounded-full border border-[#556B2F]/15 opacity-40" style={{ animationDelay: '-1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: t.home.features.natural.title,
                desc: t.home.features.natural.description,
                color: "#556B2F",
              },
              {
                icon: Heart,
                title: t.home.features.traditional.title,
                desc: t.home.features.traditional.description,
                color: "#D6A64F",
              },
              {
                icon: Shield,
                title: t.home.features.premium.title,
                desc: t.home.features.premium.description,
                color: "#556B2F",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="glass-card p-8 text-center group cursor-default"
              >
                <CardContent className="p-0">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                    }}
                  >
                    <feature.icon className="w-10 h-10" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFFBF0] via-[#FFF9E6] to-[#FFF5DC] relative overflow-hidden">
        {/* Floating Elements for Featured Products Section */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large soft gradients */}
          <div className="pulse-glow-hero absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-gradient-to-br from-[#D6A64F]/6 to-transparent blur-3xl" />
          <div className="pulse-glow-hero absolute bottom-0 right-1/4 w-[500px] h-[350px] rounded-full bg-gradient-to-tl from-[#556B2F]/5 to-transparent blur-3xl" style={{ animationDelay: '1s' }} />
          
          {/* Honey drop shapes */}
          <div className="float-slow-hero absolute top-[8%] left-[12%] opacity-35" style={{ animationDelay: '-1s' }}>
            <svg className="w-8 h-10" viewBox="0 0 24 30" fill="url(#goldGradient1)">
              <defs>
                <linearGradient id="goldGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D6A64F"/>
                  <stop offset="100%" stopColor="#F4D03F"/>
                </linearGradient>
              </defs>
              <path d="M12 0C12 0 2 12 2 18c0 5.5 4.5 10 10 10s10-4.5 10-10C22 12 12 0 12 0z"/>
            </svg>
          </div>
          <div className="float-medium-hero absolute bottom-[15%] right-[8%] opacity-25 scale-75" style={{ animationDelay: '-3s' }}>
            <svg className="w-8 h-10" viewBox="0 0 24 30" fill="url(#goldGradient2)">
              <defs>
                <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F4D03F"/>
                  <stop offset="100%" stopColor="#D6A64F"/>
                </linearGradient>
              </defs>
              <path d="M12 0C12 0 2 12 2 18c0 5.5 4.5 10 10 10s10-4.5 10-10C22 12 12 0 12 0z"/>
            </svg>
          </div>
          
          {/* Floating circles with gradients */}
          <div className="float-fast-hero absolute top-[20%] right-[15%] w-5 h-5 rounded-full bg-gradient-to-br from-[#D6A64F] to-[#F4D03F] opacity-45 shadow-md shadow-[#D6A64F]/20" style={{ animationDelay: '-0.5s' }} />
          <div className="float-slow-hero absolute top-[35%] left-[5%] w-6 h-6 rounded-full bg-gradient-to-br from-[#556B2F] to-[#6B8E23] opacity-35" style={{ animationDelay: '-2s' }} />
          <div className="float-medium-hero absolute bottom-[30%] left-[10%] w-4 h-4 rounded-full bg-[#D6A64F] opacity-50" style={{ animationDelay: '-1.5s' }} />
          <div className="float-fast-hero absolute bottom-[45%] right-[5%] w-3 h-3 rounded-full bg-[#6B8E23] opacity-40" style={{ animationDelay: '-1s' }} />
          
          {/* Sparkle elements */}
          <div className="float-medium-hero absolute top-[15%] left-[35%] opacity-40" style={{ animationDelay: '-2s' }}>
            <svg className="w-5 h-5 text-[#D6A64F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
            </svg>
          </div>
          <div className="float-slow-hero absolute bottom-[20%] right-[25%] opacity-30" style={{ animationDelay: '-4s' }}>
            <svg className="w-4 h-4 text-[#556B2F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
            </svg>
          </div>
          
          {/* Decorative lines */}
          <div className="float-slow-hero absolute top-[50%] left-[3%] w-20 h-[2px] bg-gradient-to-r from-[#D6A64F]/30 to-transparent opacity-50 rotate-45" style={{ animationDelay: '-3s' }} />
          <div className="float-medium-hero absolute bottom-[40%] right-[3%] w-16 h-[2px] bg-gradient-to-l from-[#556B2F]/25 to-transparent opacity-40 -rotate-45" style={{ animationDelay: '-2s' }} />
          
          {/* Large decorative rings */}
          <div className="float-slow-hero absolute top-[10%] right-[3%] w-24 h-24 rounded-full border border-[#D6A64F]/15 opacity-40" style={{ animationDelay: '-2.5s' }} />
          <div className="float-medium-hero absolute bottom-[10%] left-[8%] w-20 h-20 rounded-full border border-[#556B2F]/12 opacity-35" style={{ animationDelay: '-1.5s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase text-[#D6A64F] mb-4">
              {t.common.featured}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              {t.home.featured.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.home.featured.subtitle}
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-72 rounded-3xl overflow-hidden bg-white shadow-sm">
                  <Skeleton className="h-72 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex justify-between pt-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-10 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="btn-secondary"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              {products.map((product, index) => {
                const smallestPrice = getSmallestPrice(product);
                
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="product-card product-card-hover group w-80 rounded-2xl bg-white shadow-md overflow-hidden pop-in relative cursor-pointer"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Glow effect */}
                    <div className="card-glow absolute -inset-1 bg-gradient-to-r from-[#D6A64F]/20 via-[#556B2F]/10 to-[#D6A64F]/20 rounded-2xl blur-lg opacity-0 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Image container */}
                    <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-[#f8f6f1] to-[#ede9e0]">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).src = "/placeholder.svg"
                        }}
                        loading="lazy"
                        className="card-image absolute inset-0 w-full h-full object-cover transition-all duration-500"
                      />
                      {/* Hover overlay with blur */}
                      <div className="card-overlay absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-all duration-400 pointer-events-none" />
                      
                      {/* Featured badge */}
                      {product.featured && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D6A64F] to-[#E8B960] text-white text-xs font-semibold shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          {t.common.featured}
                        </div>
                      )}
                      
                      {/* Natural badge */}
                      <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                        <Leaf className="w-5 h-5 text-[#556B2F]" />
                      </div>
                      
                      {/* Quick view hint on hover */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm text-[#556B2F] text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                        {t.product.viewSizes}
                      </div>
                    </div>

                    {/* Bottom info panel */}
                    <div className="card-info p-5 bg-white transition-all duration-300">
                      {/* Category & Rating */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] uppercase tracking-widest text-[#D6A64F] font-semibold">{language === 'ar' && product.category.nameAr ? product.category.nameAr : product.category.name}</p>
                          <span className="text-[10px] text-muted-foreground/60">•</span>
                          <span className="text-[10px] text-muted-foreground/80 font-arabic">{language === 'ar' ? product.name : product.nameAr}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#D6A64F] text-[#D6A64F]" />
                          ))}
                        </div>
                      </div>
                      
                      {/* Product name */}
                      <h3 className="font-serif text-lg font-semibold text-[#2d3a1f] group-hover:text-[#556B2F] transition-colors line-clamp-1 mb-3">{language === 'ar' && product.nameAr ? product.nameAr : product.name}</h3>

                      {/* Price Section */}
                      <div className="flex items-end justify-between pt-3 border-t border-[#e9e6dd]">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                            {t.common.price}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-serif font-bold text-[#D6A64F]">
                              {smallestPrice.toFixed(0)}
                            </span>
                            <span className="text-sm text-[#D6A64F]/70">MAD</span>
                          </div>
                        </div>
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs font-medium group-hover:bg-[#556B2F] group-hover:text-white transition-colors">
                            {t.home.chooseSize}
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center">
            <Button onClick={openDialog} className="btn-primary text-lg px-10 py-6 group">
              {t.common.viewAll}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FDFCFA] via-[#FFFFFF] to-[#F9F8F6]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-4 items-start">
            {/* Video */}
            <div className="relative max-w-[360px]">
              <div className="relative rounded-2xl overflow-hidden">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-auto"
                >
                  <source src="/honey.mp4" type="video/mp4" />
                </video>
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-gradient-to-br from-[#D6A64F] to-[#E8B960] p-4 text-white shadow-2xl hidden lg:flex flex-col justify-center">
                <span className="text-2xl font-serif font-bold">30+</span>
                <span className="text-xs opacity-80">{t.home.story.yearsOfTradition}</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <span className="inline-block text-sm font-semibold uppercase text-[#D6A64F]">
                {t.home.story.badge}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                {t.home.story.heading}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t.home.story.p1}
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t.home.story.p2}
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t.home.story.p3}
              </p>
              <Link href="/about">
                <Button variant="outline" className="btn-secondary group">
                  {t.home.story.cta}
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Will add later */}
      {/* <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFF8F0] via-[#FFFAF5] to-[#FFF5EB] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="pulse-glow-hero absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-[#D6A64F]/8 to-transparent blur-3xl" />
          <div className="pulse-glow-hero absolute bottom-1/4 right-0 w-[350px] h-[350px] rounded-full bg-gradient-to-l from-[#556B2F]/6 to-transparent blur-3xl" style={{ animationDelay: '1.5s' }} />
          
          <div className="float-slow-hero absolute top-[12%] left-[8%] text-[#D6A64F]/15 font-serif text-8xl" style={{ animationDelay: '-1s' }}>"</div>
          <div className="float-medium-hero absolute bottom-[15%] right-[10%] text-[#556B2F]/12 font-serif text-7xl rotate-180" style={{ animationDelay: '-3s' }}>"</div>
          
          <div className="float-fast-hero absolute top-[20%] right-[20%] opacity-35" style={{ animationDelay: '-0.5s' }}>
            <svg className="w-6 h-6 text-[#D6A64F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
            </svg>
          </div>
          <div className="float-slow-hero absolute bottom-[30%] left-[15%] opacity-25" style={{ animationDelay: '-2.5s' }}>
            <svg className="w-5 h-5 text-[#F4D03F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
            </svg>
          </div>
          <div className="float-medium-hero absolute top-[45%] left-[5%] opacity-30" style={{ animationDelay: '-1.5s' }}>
            <svg className="w-4 h-4 text-[#D6A64F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
            </svg>
          </div>
          
          <div className="float-slow-hero absolute top-[30%] right-[5%] w-5 h-5 rounded-full bg-gradient-to-br from-[#D6A64F] to-[#F4D03F] opacity-40" style={{ animationDelay: '-2s' }} />
          <div className="float-medium-hero absolute top-[60%] left-[10%] w-4 h-4 rounded-full bg-gradient-to-br from-[#556B2F] to-[#6B8E23] opacity-35" style={{ animationDelay: '-3s' }} />
          <div className="float-fast-hero absolute bottom-[20%] left-[25%] w-3 h-3 rounded-full bg-[#D6A64F] opacity-45" style={{ animationDelay: '-1s' }} />
          <div className="float-slow-hero absolute top-[15%] left-[40%] w-6 h-6 rounded-full bg-gradient-to-br from-[#D6A64F]/60 to-[#D6A64F]/20 opacity-30" style={{ animationDelay: '-4s' }} />
          
          <div className="float-medium-hero absolute top-[25%] left-[20%] opacity-25" style={{ animationDelay: '-2s' }}>
            <svg className="w-5 h-5 text-[#D6A64F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="float-slow-hero absolute bottom-[35%] right-[15%] opacity-20" style={{ animationDelay: '-3.5s' }}>
            <svg className="w-4 h-4 text-[#556B2F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          
          <div className="float-slow-hero absolute bottom-[10%] right-[5%] w-16 h-16 rounded-full border border-[#D6A64F]/20 opacity-40" style={{ animationDelay: '-2s' }} />
          <div className="float-medium-hero absolute top-[10%] left-[3%] w-12 h-12 rounded-full border border-[#556B2F]/15 opacity-35" style={{ animationDelay: '-1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold uppercase text-[#D6A64F] mb-4">
              {t.home.testimonials.label}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              {t.home.testimonials.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.home.testimonials.description}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Amina Hassan",
                location: "Casablanca",
                text: "The quality is exceptional. This is real, authentic honey from the mountains. I can taste the difference immediately.",
                rating: 5,
              },
              {
                name: "Mohamed Ali",
                location: "Rabat",
                text: "I've been using Silea oils for cooking and they're incredible. Pure, rich flavor that elevates every dish I make.",
                rating: 5,
              },
              {
                name: "Fatima El Amrani",
                location: "Marrakech",
                text: "Beautiful packaging, excellent products. Silea truly represents the heritage of Beni Mellal. Highly recommend!",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="glass-card p-8 space-y-4">
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#D6A64F] text-[#D6A64F]" />
                    ))}
                  </div>
                  <p className="text-foreground italic leading-relaxed mb-6">
                    "{testimonial.text}"
                  </p>
                  <div className="pt-4 border-t border-[#556B2F]/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#556B2F] to-[#6B8E23] flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-serif font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      <Footer />
    </div>
  )
}
