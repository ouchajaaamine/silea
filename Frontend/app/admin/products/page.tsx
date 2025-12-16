"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Filter,
  Menu,
  Upload,
  X,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  productsApi, 
  categoriesApi,
  filesApi,
  type Product, 
  type Category,
  OIL_SIZES,
  HONEY_SIZES,
  type ProductSize,
  type ProductSizeCode,
  toBackendSizeCode,
  getSmallestPrice,
  getPriceRange,
  getProductImageUrl,
} from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { toast } from "sonner"

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  
  // Form state for new product
  const [formData, setFormData] = useState({
    name: "",
    nameArabic: "",
    description: "",
    descriptionFr: "",
    descriptionAr: "",
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
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    nameArabic: "",
    description: "",
    descriptionFr: "",
    descriptionAr: "",
    categoryId: "",
    imageUrl: "",
    available: true,
  })
  const [editSizePrices, setEditSizePrices] = useState<Record<ProductSizeCode, string>>({
    OIL_5L: "",
    OIL_2L: "",
    OIL_1L: "",
    HONEY_1KG: "",
    HONEY_500G: "",
    HONEY_250G: "",
  })
  
  const [submitting, setSubmitting] = useState(false)
  
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
  
  const availableSizes = useMemo(() => getAvailableSizes(formData.categoryId), [formData.categoryId, categories])
  const editAvailableSizes = useMemo(() => getAvailableSizes(editFormData.categoryId), [editFormData.categoryId, categories])

  useEffect(() => {
    const token = localStorage.getItem("silea_token")
    if (!token) {
      router.push("/admin")
      return
    }

    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsApi.getAll(),
          categoriesApi.getActive(),
        ])
        setProducts(productsData.products || [])
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Filter products based on search, category, and status
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch = 
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameAr.includes(searchQuery) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Category filter
      const matchesCategory = 
        categoryFilter === "all" || 
        product.category.id.toString() === categoryFilter
      
      // Status filter
      const matchesStatus = 
        statusFilter === "all" || 
        product.status === statusFilter
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, searchQuery, categoryFilter, statusFilter])

  // State for upload progress
  const [isUploading, setIsUploading] = useState(false)

  // Handle image file selection - upload to backend
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB")
        return
      }
      
      // Show preview immediately using local URL
      const localPreview = URL.createObjectURL(file)
      if (isEdit) {
        setEditImagePreview(localPreview)
      } else {
        setImagePreview(localPreview)
      }
      
      // Upload to backend
      setIsUploading(true)
      try {
        const result = await filesApi.uploadFile(file)
        if (result.success) {
          const imageUrl = result.url // Server returns relative URL like /api/files/images/xxx.jpg
          if (isEdit) {
            setEditFormData(prev => ({ ...prev, imageUrl }))
          } else {
            setFormData(prev => ({ ...prev, imageUrl }))
          }
          toast.success("Image uploaded successfully")
        }
      } catch (error: any) {
        console.error("Upload error:", error)
        toast.error(error.message || "Failed to upload image")
        // Clear preview on error
        if (isEdit) {
          setEditImagePreview(null)
          setEditFormData(prev => ({ ...prev, imageUrl: "" }))
        } else {
          setImagePreview(null)
          setFormData(prev => ({ ...prev, imageUrl: "" }))
        }
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return

    try {
      await productsApi.delete(id)
      setProducts(products.filter((p) => p.id !== id))
      toast.success("Product deleted successfully")
    } catch (error: any) {
      console.error("Delete error:", error)
      toast.error(error.message || "Failed to delete product")
    }
  }

  const handleToggleFeatured = async (id: number, currentFeatured: boolean) => {
    try {
      await productsApi.updateFeatured(id, !currentFeatured)
      setProducts(
        products.map((p) => (p.id === id ? { ...p, featured: !currentFeatured } : p))
      )
      toast.success(currentFeatured ? "Product removed from featured" : "Product marked as featured")
    } catch (error: any) {
      console.error("Featured toggle error:", error)
      toast.error(error.message || "Failed to update product")
    }
  }

  const handleToggleAvailable = async (id: number, available: boolean) => {
    try {
      await productsApi.updateAvailable(id, available)
      setProducts(
        products.map((p) => (p.id === id ? { ...p, available } : p))
      )
      toast.success(available ? "Product is now available" : "Product is now unavailable")
    } catch (error: any) {
      console.error("Available toggle error:", error)
      toast.error(error.message || "Failed to update product")
    }
  }

  const handleToggleStatus = async (id: number, active: boolean) => {
    try {
      const status = active ? 'ACTIVE' : 'INACTIVE'
      await productsApi.updateStatus(id, status)
      setProducts(
        products.map((p) => (p.id === id ? { ...p, status } : p))
      )
      toast.success(active ? "Product activated" : "Product deactivated")
    } catch (error: any) {
      console.error("Status toggle error:", error)
      toast.error(error.message || "Failed to update product")
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditFormData({
      name: product.name,
      nameArabic: product.nameAr,
      description: product.description || "",
      descriptionFr: product.descriptionFr || "",
      descriptionAr: product.descriptionAr || "",
      categoryId: product.category.id.toString(),
      imageUrl: product.imageUrl || "",
      available: product.available,
    })
    // Use filesApi to get proper image URL for preview
    setEditImagePreview(product.imageUrl ? filesApi.getImageUrl(product.imageUrl) : null)
    
    // Set size prices from product
    const newSizePrices: Record<ProductSizeCode, string> = {
      OIL_5L: "",
      OIL_2L: "",
      OIL_1L: "",
      HONEY_1KG: "",
      HONEY_500G: "",
      HONEY_250G: "",
    }
    
    if (product.sizePrices) {
      product.sizePrices.forEach(sp => {
        // Map backend sizeCode to frontend code
        const frontendCode = mapBackendToFrontendSizeCode(sp.sizeCode || sp.size)
        if (frontendCode) {
          newSizePrices[frontendCode] = sp.price.toString()
        }
      })
    }
    setEditSizePrices(newSizePrices)
    setIsEditDialogOpen(true)
  }

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.categoryId) {
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
      
      await productsApi.create({
        name: formData.name,
        nameArabic: formData.nameArabic,
        description: formData.description,
        descriptionFr: formData.descriptionFr,
        descriptionAr: formData.descriptionAr,
        price: basePrice,
        available: formData.available,
        categoryId: parseInt(formData.categoryId),
        imageUrl: formData.imageUrl,
        sizePrices: filledPrices.map(s => ({
          sizeCode: toBackendSizeCode(s.code),
          price: parseFloat(sizePrices[s.code])
        }))
      })
      
      toast.success("Product created successfully")
      setIsCreateDialogOpen(false)
      resetCreateForm()
      
      // Refresh products list
      const data = await productsApi.getAll()
      setProducts(data.products || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to create product")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    
    if (!editFormData.name) {
      toast.error("Please fill in required fields")
      return
    }
    
    const filledPrices = editAvailableSizes.filter(s => editSizePrices[s.code] && parseFloat(editSizePrices[s.code]) > 0)
    if (filledPrices.length === 0) {
      toast.error("Please enter at least one size price")
      return
    }
    
    setSubmitting(true)
    try {
      const largestSize = editAvailableSizes[0]
      const basePrice = parseFloat(editSizePrices[largestSize.code]) || 0
      
      await productsApi.update(selectedProduct.id, {
        name: editFormData.name,
        nameArabic: editFormData.nameArabic,
        description: editFormData.description,
        descriptionFr: editFormData.descriptionFr,
        descriptionAr: editFormData.descriptionAr,
        price: basePrice,
        available: editFormData.available,
        imageUrl: editFormData.imageUrl,
        sizePrices: filledPrices.map(s => ({
          sizeCode: toBackendSizeCode(s.code),
          price: parseFloat(editSizePrices[s.code])
        }))
      })
      
      toast.success("Product updated successfully")
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      
      // Refresh products list
      const data = await productsApi.getAll()
      setProducts(data.products || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to update product")
    } finally {
      setSubmitting(false)
    }
  }

  const resetCreateForm = () => {
    setFormData({
      name: "",
      nameArabic: "",
      description: "",
      descriptionFr: "",
      descriptionAr: "",
      categoryId: "",
      imageUrl: "",
      available: true,
    })
    setSizePrices({
      OIL_5L: "",
      OIL_2L: "",
      OIL_1L: "",
      HONEY_1KG: "",
      HONEY_500G: "",
      HONEY_250G: "",
    })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-[#556B2F]">Active</Badge>
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 glass-card border-b border-white/20 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl font-bold">Products</h1>
                <p className="text-sm text-muted-foreground">Manage your product catalog</p>
              </div>
            </div>

            {/* Create Product Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open)
              if (!open) resetCreateForm()
            }}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new product to your catalog
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Name *</Label>
                      <Input 
                        className="input-glass" 
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arabic Name</Label>
                      <Input 
                        className="input-glass" 
                        placeholder="اسم المنتج" 
                        dir="rtl"
                        value={formData.nameArabic}
                        onChange={(e) => setFormData({...formData, nameArabic: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => {
                        setFormData({...formData, categoryId: value})
                        setSizePrices({
                          OIL_5L: "",
                          OIL_2L: "",
                          OIL_1L: "",
                          HONEY_1KG: "",
                          HONEY_500G: "",
                          HONEY_250G: "",
                        })
                      }}
                    >
                      <SelectTrigger className="input-glass">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Size Prices */}
                  {availableSizes.length > 0 && (
                    <div className="space-y-3 p-4 rounded-lg bg-[#556B2F]/5 border border-[#556B2F]/20">
                      <Label className="text-[#556B2F] font-semibold">Size Prices (MAD) *</Label>
                      <p className="text-xs text-muted-foreground">Enter the price for each available size</p>
                      <div className="grid grid-cols-3 gap-3">
                        {availableSizes.map((size) => (
                          <div key={size.code} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{size.displayName}</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="input-glass"
                              placeholder="0.00"
                              value={sizePrices[size.code]}
                              onChange={(e) => setSizePrices({...sizePrices, [size.code]: e.target.value})}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="flex flex-col gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageSelect(e, false)}
                      />
                      <div
                        className="w-full border-dashed border-2 h-32 flex flex-col gap-2 items-center justify-center rounded-md cursor-pointer hover:bg-accent/50 transition-colors border-input"
                        onClick={() => !imagePreview && fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img src={imagePreview} alt="Preview" className="h-24 object-contain mx-auto" />
                            <button
                              type="button"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setImagePreview(null)
                                setFormData(prev => ({ ...prev, imageUrl: "" }))
                                if (fileInputRef.current) fileInputRef.current.value = ""
                              }}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </button>
                            <button
                              type="button"
                              className="absolute bottom-1 text-xs text-muted-foreground hover:text-foreground underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                fileInputRef.current?.click()
                              }}
                            >
                              Change image
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to browse images</span>
                            <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description (English)</Label>
                    <Textarea 
                      className="input-glass" 
                      placeholder="Product description in English..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description (French)</Label>
                    <Textarea 
                      className="input-glass" 
                      placeholder="Description du produit en français..."
                      value={formData.descriptionFr}
                      onChange={(e) => setFormData({...formData, descriptionFr: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description (Arabic)</Label>
                    <Textarea 
                      className="input-glass" 
                      placeholder="وصف المنتج بالعربية..."
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="available">Product is available for sale</Label>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? "Creating..." : "Create Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {/* Filters */}
          <Card className="glass-card mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, Arabic name, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-glass pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] input-glass">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] input-glass">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Filter Results Count */}
              <div className="mt-3 text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
                {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-[#D6A64F] hover:text-[#D6A64F]/80"
                    onClick={() => {
                      setSearchQuery("")
                      setCategoryFilter("all")
                      setStatusFilter("all")
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="glass-card">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Start by adding your first product"}
                  </p>
                  {!searchQuery && categoryFilter === "all" && statusFilter === "all" && (
                    <Button className="btn-primary" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const priceRange = getPriceRange(product)
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={getProductImageUrl(product)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.nameAr}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category.name}</TableCell>
                          <TableCell className="font-medium text-[#D6A64F]">
                            {priceRange.min === priceRange.max 
                              ? `${priceRange.min} MAD`
                              : `${priceRange.min} - ${priceRange.max} MAD`
                            }
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={product.available}
                              onCheckedChange={(checked) => handleToggleAvailable(product.id, checked)}
                              className="data-[state=checked]:bg-[#556B2F]"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={product.status === 'ACTIVE'}
                              onCheckedChange={(checked) => handleToggleStatus(product.id, checked)}
                              className="data-[state=checked]:bg-[#556B2F]"
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleToggleFeatured(product.id, product.featured)}
                              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                                product.featured 
                                  ? "text-[#D6A64F] bg-[#D6A64F]/10" 
                                  : "text-muted-foreground hover:text-[#D6A64F] hover:bg-[#D6A64F]/5"
                              }`}
                              title={product.featured ? "Remove from featured" : "Mark as featured"}
                            >
                              <Star className={`w-5 h-5 ${product.featured ? "fill-current" : ""}`} />
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/admin/products/${product.id}`}>
                                <Button variant="ghost" size="icon" title="View Details">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)} title="Edit">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="glass-card border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-xl overflow-hidden bg-muted">
                  <img
                    src={filesApi.getImageUrl(selectedProduct.imageUrl) || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Product Name</Label>
                  <p className="font-semibold">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Arabic Name</Label>
                  <p className="font-semibold font-arabic" dir="rtl">{selectedProduct.nameAr}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Category</Label>
                  <p className="font-semibold">{selectedProduct.category.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Available</Label>
                  <Badge className={selectedProduct.available ? "bg-[#556B2F]" : "bg-red-500"}>
                    {selectedProduct.available ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Featured</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className={`w-4 h-4 ${selectedProduct.featured ? "fill-[#D6A64F] text-[#D6A64F]" : "text-muted-foreground"}`} />
                    <span>{selectedProduct.featured ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
              
              {/* Size Prices */}
              {selectedProduct.sizePrices && selectedProduct.sizePrices.length > 0 && (
                <div className="p-4 rounded-lg bg-[#556B2F]/5 border border-[#556B2F]/20">
                  <Label className="text-[#556B2F] font-semibold">Size Prices</Label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {selectedProduct.sizePrices.map((sp, index) => (
                      <div key={index} className="text-center p-3 rounded-lg bg-white/50">
                        <p className="text-xs text-muted-foreground">{sp.sizeDisplayName || sp.sizeCode}</p>
                        <p className="font-bold text-[#D6A64F]">{sp.price} MAD</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {selectedProduct.description && (
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-sm mt-1">{selectedProduct.description}</p>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  className="btn-primary" 
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditProduct(selectedProduct)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input 
                  className="input-glass" 
                  placeholder="Enter product name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Arabic Name</Label>
                <Input 
                  className="input-glass" 
                  placeholder="اسم المنتج" 
                  dir="rtl"
                  value={editFormData.nameArabic}
                  onChange={(e) => setEditFormData({...editFormData, nameArabic: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={editFormData.categoryId} 
                onValueChange={(value) => {
                  setEditFormData({...editFormData, categoryId: value})
                  setEditSizePrices({
                    OIL_5L: "",
                    OIL_2L: "",
                    OIL_1L: "",
                    HONEY_1KG: "",
                    HONEY_500G: "",
                    HONEY_250G: "",
                  })
                }}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Size Prices */}
            {editAvailableSizes.length > 0 && (
              <div className="space-y-3 p-4 rounded-lg bg-[#556B2F]/5 border border-[#556B2F]/20">
                <Label className="text-[#556B2F] font-semibold">Size Prices (MAD) *</Label>
                <p className="text-xs text-muted-foreground">Enter the price for each available size</p>
                <div className="grid grid-cols-3 gap-3">
                  {editAvailableSizes.map((size) => (
                    <div key={size.code} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{size.displayName}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-glass"
                        placeholder="0.00"
                        value={editSizePrices[size.code]}
                        onChange={(e) => setEditSizePrices({...editSizePrices, [size.code]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex flex-col gap-3">
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e, true)}
                />
                <div
                  className="w-full border-dashed border-2 h-32 flex flex-col gap-2 items-center justify-center rounded-md cursor-pointer hover:bg-accent/50 transition-colors border-input"
                  onClick={() => !editImagePreview && editFileInputRef.current?.click()}
                >
                  {editImagePreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={editImagePreview} alt="Preview" className="h-24 object-contain mx-auto" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditImagePreview(null)
                          setEditFormData(prev => ({ ...prev, imageUrl: "" }))
                          if (editFileInputRef.current) editFileInputRef.current.value = ""
                        }}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                      <button
                        type="button"
                        className="absolute bottom-1 text-xs text-muted-foreground hover:text-foreground underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          editFileInputRef.current?.click()
                        }}
                      >
                        Change image
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to browse images</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea 
                className="input-glass" 
                placeholder="Product description in English..."
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description (French)</Label>
              <Textarea 
                className="input-glass" 
                placeholder="Description du produit en français..."
                value={editFormData.descriptionFr}
                onChange={(e) => setEditFormData({...editFormData, descriptionFr: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description (Arabic)</Label>
              <Textarea 
                className="input-glass" 
                placeholder="وصف المنتج بالعربية..."
                value={editFormData.descriptionAr}
                onChange={(e) => setEditFormData({...editFormData, descriptionAr: e.target.value})}
                rows={3}
                dir="rtl"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editAvailable"
                checked={editFormData.available}
                onChange={(e) => setEditFormData({...editFormData, available: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="editAvailable">Product is available for sale</Label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

