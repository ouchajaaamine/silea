"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Save,
  X,
  Upload,
  LayoutDashboard,
  ShoppingCart,
  Users,
  FolderTree,
  Truck,
  Leaf,
  LogOut,
  Menu,
  ImagePlus,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Crown,
  GripVertical,
  Check,
  Eye,
  Calendar,
  Tag,
  DollarSign,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  productsApi, 
  categoriesApi,
  filesApi,
  type Product, 
  type Category,
  type ProductImage,
  OIL_SIZES,
  HONEY_SIZES,
  type ProductSizeCode,
  toBackendSizeCode,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products", active: true },
  { icon: FolderTree, label: "Categories", href: "/admin/categories" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Truck, label: "Tracking", href: "/admin/tracking" },
]

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { logout } = useAuth()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Image gallery
  const [images, setImages] = useState<ProductImage[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nameArabic: "",
    description: "",
    categoryId: "",
    imageUrl: "",
    available: true,
  })
  const [sizePrices, setSizePrices] = useState<Record<ProductSizeCode, string>>({
    OIL_5L: "",
    OIL_2L: "",
    OIL_1L: "",
    HONEY_1KG: "",
    HONEY_500G: "",
    HONEY_250G: "",
  })

  // Get available sizes based on selected category
  const getAvailableSizes = (categoryId: string) => {
    if (!categoryId) return []
    const category = categories.find(c => c.id.toString() === categoryId)
    if (!category) return []
    const name = category.name.toLowerCase()
    if (name.includes('oil') || name.includes('huile') || name.includes('زيت')) {
      return OIL_SIZES
    }
    return HONEY_SIZES
  }
  
  const availableSizes = getAvailableSizes(formData.categoryId)

  // Map backend size code to frontend code
  const mapBackendToFrontendSizeCode = (backendCode: string): ProductSizeCode | null => {
    const mapping: Record<string, ProductSizeCode> = {
      '5L': 'OIL_5L',
      '2L': 'OIL_2L',
      '1L': 'OIL_1L',
      '1kg': 'HONEY_1KG',
      '500g': 'HONEY_500G',
      '250g': 'HONEY_250G',
      'OIL_5L': 'OIL_5L',
      'OIL_2L': 'OIL_2L',
      'OIL_1L': 'OIL_1L',
      'HONEY_1KG': 'HONEY_1KG',
      'HONEY_500G': 'HONEY_500G',
      'HONEY_250G': 'HONEY_250G',
    }
    return mapping[backendCode] || null
  }

  const fetchImages = async () => {
    try {
      const productImages = await productsApi.getImages(parseInt(productId))
      setImages(productImages)
    } catch (error) {
      console.error("Failed to fetch images:", error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("silea_token")
    if (!token) {
      router.push("/admin")
      return
    }

    const fetchData = async () => {
      try {
        const [productData, categoriesData] = await Promise.all([
          productsApi.getById(parseInt(productId)),
          categoriesApi.getActive(),
        ])
        
        setProduct(productData)
        setCategories(categoriesData)
        
        // Fetch images
        await fetchImages()
        
        // Initialize form data
        setFormData({
          name: productData.name,
          nameArabic: productData.nameAr,
          description: productData.description || "",
          categoryId: productData.category.id.toString(),
          imageUrl: productData.imageUrl || "",
          available: productData.available,
        })
        
        // Set size prices
        const newSizePrices: Record<ProductSizeCode, string> = {
          OIL_5L: "",
          OIL_2L: "",
          OIL_1L: "",
          HONEY_1KG: "",
          HONEY_500G: "",
          HONEY_250G: "",
        }
        if (productData.sizePrices) {
          productData.sizePrices.forEach((sp: any) => {
            const frontendCode = mapBackendToFrontendSizeCode(sp.sizeCode || sp.size)
            if (frontendCode) {
              newSizePrices[frontendCode] = sp.price.toString()
            }
          })
        }
        setSizePrices(newSizePrices)
      } catch (error) {
        console.error("Failed to fetch product:", error)
        toast.error("Failed to load product")
        router.push("/admin/products")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    const uploadedUrls: string[] = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`)
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`)
          continue
        }
        
        const result = await filesApi.uploadFile(file)
        if (result.success) {
          uploadedUrls.push(result.url)
        }
      }
      
      if (uploadedUrls.length > 0) {
        await productsApi.addImages(parseInt(productId), uploadedUrls)
        await fetchImages()
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      await productsApi.deleteImage(parseInt(productId), imageId)
      await fetchImages()
      if (selectedImageIndex >= images.length - 1) {
        setSelectedImageIndex(Math.max(0, images.length - 2))
      }
      toast.success("Image deleted")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image")
    }
  }

  const handleSetPrimaryImage = async (imageId: number) => {
    try {
      await productsApi.setPrimaryImage(parseInt(productId), imageId)
      await fetchImages()
      toast.success("Primary image updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to set primary image")
    }
  }

  const handleToggleAvailable = async () => {
    if (!product) return
    try {
      await productsApi.updateAvailable(product.id, !product.available)
      setProduct({ ...product, available: !product.available })
      setFormData(prev => ({ ...prev, available: !product.available }))
      toast.success(product.available ? "Product is now unavailable" : "Product is now available")
    } catch (error: any) {
      toast.error(error.message || "Failed to update availability")
    }
  }

  const handleToggleStatus = async () => {
    if (!product) return
    try {
      const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await productsApi.updateStatus(product.id, newStatus)
      setProduct({ ...product, status: newStatus })
      toast.success(newStatus === 'ACTIVE' ? "Product activated" : "Product deactivated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update status")
    }
  }

  const handleToggleFeatured = async () => {
    if (!product) return
    try {
      await productsApi.updateFeatured(product.id, !product.featured)
      setProduct({ ...product, featured: !product.featured })
      toast.success(product.featured ? "Removed from featured" : "Added to featured")
    } catch (error: any) {
      toast.error(error.message || "Failed to update featured status")
    }
  }

  const handleDelete = async () => {
    if (!product) return
    try {
      await productsApi.delete(product.id)
      toast.success("Product deactivated successfully")
      router.push("/admin/products")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product")
    }
  }

  const handleSave = async () => {
    if (!product || !formData.name || !formData.categoryId) {
      toast.error("Please fill in required fields")
      return
    }
    
    const filledPrices = availableSizes.filter(s => sizePrices[s.code] && parseFloat(sizePrices[s.code]) > 0)
    if (filledPrices.length === 0) {
      toast.error("Please enter at least one size price")
      return
    }
    
    setSubmitting(true)
    try {
      const largestSize = availableSizes[0]
      const basePrice = parseFloat(sizePrices[largestSize.code]) || 0
      
      await productsApi.update(product.id, {
        name: formData.name,
        nameArabic: formData.nameArabic,
        description: formData.description,
        price: basePrice,
        available: formData.available,
        imageUrl: formData.imageUrl,
        sizePrices: filledPrices.map(s => ({
          sizeCode: toBackendSizeCode(s.code),
          price: parseFloat(sizePrices[s.code])
        }))
      })
      
      const updatedProduct = await productsApi.getById(product.id)
      setProduct(updatedProduct)
      
      toast.success("Product updated successfully")
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to update product")
    } finally {
      setSubmitting(false)
    }
  }

  const cancelEdit = () => {
    if (product) {
      setFormData({
        name: product.name,
        nameArabic: product.nameAr,
        description: product.description || "",
        categoryId: product.category.id.toString(),
        imageUrl: product.imageUrl || "",
        available: product.available,
      })
      
      const newSizePrices: Record<ProductSizeCode, string> = {
        OIL_5L: "",
        OIL_2L: "",
        OIL_1L: "",
        HONEY_1KG: "",
        HONEY_500G: "",
        HONEY_250G: "",
      }
      if (product.sizePrices) {
        product.sizePrices.forEach((sp: any) => {
          const frontendCode = mapBackendToFrontendSizeCode(sp.sizeCode || sp.size)
          if (frontendCode) {
            newSizePrices[frontendCode] = sp.price.toString()
          }
        })
      }
      setSizePrices(newSizePrices)
    }
    setIsEditing(false)
  }

  // Get current display image
  const currentImage = images.length > 0 
    ? filesApi.getImageUrl(images[selectedImageIndex]?.imageUrl)
    : product?.imageUrl 
      ? filesApi.getImageUrl(product.imageUrl)
      : "/placeholder.svg"

  const navigateImage = (direction: 'prev' | 'next') => {
    if (images.length === 0) return
    if (direction === 'prev') {
      setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
    } else {
      setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#F8F5EE] to-[#E8E0D0] dark:from-[#1a1a18] dark:via-[#222220] dark:to-[#2d2d28]">
        <div className="lg:ml-64 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#F8F5EE] to-[#E8E0D0] dark:from-[#1a1a18] dark:via-[#222220] dark:to-[#2d2d28] flex items-center justify-center">
        <div className="text-center glass-card p-12 rounded-3xl">
          <div className="w-24 h-24 rounded-full bg-[#556B2F]/10 flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-[#556B2F]/50" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-3">Product not found</h2>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/admin/products">
            <Button className="btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#F8F5EE] to-[#E8E0D0] dark:from-[#1a1a18] dark:via-[#222220] dark:to-[#2d2d28]">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full glass-card border-r border-white/20 flex flex-col">
            <div className="p-6 border-b border-[#556B2F]/10">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="Silea Logo" className="w-full h-full object-contain p-2" />
                </div>
                <div>
                  <h1 className="font-serif text-xl font-bold text-[#556B2F]">Silea</h1>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground">Admin Panel</p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    item.active
                      ? "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white shadow-lg"
                      : "text-muted-foreground hover:bg-[#556B2F]/10 hover:text-[#556B2F]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-[#556B2F]/10">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-50"
                onClick={() => {
                  logout()
                  router.push("/admin")
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 glass-card border-b border-white/20">
            <div className="px-4 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                  <Link href="/admin/products">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Products</span>
                    </Button>
                  </Link>
                  <Separator orientation="vertical" className="h-6 hidden sm:block" />
                  <div className="hidden sm:block">
                    <h1 className="font-serif text-xl font-bold">{product.name}</h1>
                    <p className="text-xs text-muted-foreground">Product ID: #{product.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={cancelEdit} disabled={submitting} size="sm">
                        <X className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Cancel</span>
                      </Button>
                      <Button className="btn-primary" onClick={handleSave} disabled={submitting} size="sm">
                        <Save className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">{submitting ? "Saving..." : "Save"}</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                        <Edit className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Deactivate</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will set the product status to INACTIVE. The product will not be visible to customers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Status Bar */}
              <Card className="glass-card border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#556B2F]/10 via-[#6B8E23]/10 to-[#556B2F]/10 p-4 lg:p-6">
                  <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${product.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="text-sm font-medium">Status</span>
                      <Switch
                        checked={product.status === 'ACTIVE'}
                        onCheckedChange={handleToggleStatus}
                        className="data-[state=checked]:bg-[#556B2F]"
                      />
                    </div>
                    
                    <Separator orientation="vertical" className="h-8 hidden lg:block" />
                    
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Available</span>
                      <Switch
                        checked={product.available}
                        onCheckedChange={handleToggleAvailable}
                        className="data-[state=checked]:bg-[#556B2F]"
                      />
                    </div>
                    
                    <Separator orientation="vertical" className="h-8 hidden lg:block" />
                    
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Featured</span>
                      <button
                        onClick={handleToggleFeatured}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          product.featured 
                            ? "text-[#D6A64F] bg-[#D6A64F]/20 shadow-lg shadow-[#D6A64F]/20" 
                            : "text-muted-foreground hover:text-[#D6A64F] hover:bg-[#D6A64F]/10"
                        }`}
                      >
                        <Star className={`w-5 h-5 transition-transform ${product.featured ? "fill-current scale-110" : ""}`} />
                      </button>
                    </div>
                    
                    <div className="ml-auto flex items-center gap-2">
                      <Badge className={`text-sm px-3 py-1 ${product.status === 'ACTIVE' ? 'bg-[#556B2F] text-white' : 'bg-gray-200 text-gray-700'}`}>
                        {product.status}
                      </Badge>
                      {product.featured && (
                        <Badge className="bg-[#D6A64F] text-white text-sm px-3 py-1">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <Card className="glass-card border-0 shadow-xl overflow-hidden">
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Image Navigation */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => navigateImage('prev')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigateImage('next')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Image Counter */}
                      {images.length > 0 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      )}
                      
                      {/* Primary Badge */}
                      {images.length > 0 && images[selectedImageIndex]?.isPrimary && (
                        <div className="absolute top-4 left-4 bg-[#D6A64F] text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Primary
                        </div>
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                            <span className="text-white text-sm">Uploading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                  
                  {/* Thumbnail Gallery */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                          index === selectedImageIndex 
                            ? 'border-[#556B2F] shadow-lg scale-105' 
                            : 'border-transparent hover:border-[#556B2F]/50'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={filesApi.getImageUrl(img.imageUrl)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {img.isPrimary && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-[#D6A64F] rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors group flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSetPrimaryImage(img.id); }}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center transition-opacity"
                              >
                                <Crown className="w-3 h-3 text-[#D6A64F]" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Set as primary</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center transition-opacity"
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Delete image</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Image Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-[#556B2F]/30 hover:border-[#556B2F] hover:bg-[#556B2F]/5 transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <ImagePlus className="w-5 h-5 text-[#556B2F]" />
                      <span className="text-xs text-muted-foreground">Add</span>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  {/* Basic Info Card */}
                  <Card className="glass-card border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 text-[#556B2F]">
                        <Tag className="w-5 h-5" />
                        <CardTitle className="text-lg">Product Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Product Name</Label>
                        {isEditing ? (
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-glass mt-2 text-lg font-semibold"
                          />
                        ) : (
                          <h2 className="text-2xl font-serif font-bold mt-1">{product.name}</h2>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Arabic Name</Label>
                        {isEditing ? (
                          <Input
                            value={formData.nameArabic}
                            onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                            className="input-glass mt-2 text-lg font-arabic"
                            dir="rtl"
                          />
                        ) : (
                          <p className="text-xl font-arabic mt-1" dir="rtl">{product.nameAr}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                        {isEditing ? (
                          <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                            <SelectTrigger className="input-glass mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-sm px-3 py-1">
                              {product.category.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Card */}
                  <Card className="glass-card border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 text-[#556B2F]">
                        <Layers className="w-5 h-5" />
                        <CardTitle className="text-lg">Description</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="input-glass min-h-[120px]"
                          placeholder="Enter product description..."
                        />
                      ) : (
                        <p className="text-muted-foreground leading-relaxed">
                          {product.description || "No description available"}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pricing Card */}
                  <Card className="glass-card border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 text-[#D6A64F]">
                        <DollarSign className="w-5 h-5" />
                        <CardTitle className="text-lg">Size & Pricing</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {availableSizes.map((size) => (
                          <div 
                            key={size.code} 
                            className={`relative p-4 rounded-xl transition-all duration-300 ${
                              sizePrices[size.code] 
                                ? 'bg-gradient-to-br from-[#556B2F]/10 to-[#6B8E23]/5 border border-[#556B2F]/20' 
                                : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{size.displayName}</div>
                            {isEditing ? (
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={sizePrices[size.code]}
                                  onChange={(e) => setSizePrices({ ...sizePrices, [size.code]: e.target.value })}
                                  className="input-glass pr-14 text-lg font-bold"
                                  placeholder="0.00"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">MAD</span>
                              </div>
                            ) : (
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-[#D6A64F]">
                                  {sizePrices[size.code] || "—"}
                                </span>
                                {sizePrices[size.code] && (
                                  <span className="text-sm text-muted-foreground">MAD</span>
                                )}
                              </div>
                            )}
                            {sizePrices[size.code] && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-4 h-4 text-[#556B2F]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meta Info */}
                  <Card className="glass-card border-0 shadow-xl">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
