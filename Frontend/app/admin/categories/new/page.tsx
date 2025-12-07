"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FolderTree, LayoutDashboard, ShoppingCart, Users, Truck, LogOut, Menu, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { categoriesApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: FolderTree, label: "Categories", href: "/admin/categories", active: true },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Truck, label: "Tracking", href: "/admin/tracking" },
]

export default function NewCategoryPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    nameArabic: "",
    description: "",
    slug: "",
    imageUrl: "",
  })

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    const newSlug = formData.slug ? formData.slug : generateSlug(name)
    setFormData({ ...formData, name, slug: newSlug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!formData.nameArabic.trim()) {
      toast.error("Arabic name is required")
      return
    }

    setLoading(true)
    try {
      await categoriesApi.create(formData)
      toast.success("Category created successfully")
      router.push("/admin/categories")
    } catch (error) {
      console.error("Failed to create category:", error)
      toast.error("Failed to create category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
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

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 glass-card border-b border-white/20 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <Link href="/admin/categories">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl font-bold">New Category</h1>
                <p className="text-sm text-muted-foreground">Create a new product category</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Card className="glass-card max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#556B2F]" />
                Category Details
              </CardTitle>
              <CardDescription>Fill in the information for the new category</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (English) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Honey, Oils, Amlou"
                      className="border-[#e9e6dd] focus:border-[#556B2F] focus:ring-[#556B2F]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameArabic">Name (Arabic) *</Label>
                    <Input
                      id="nameArabic"
                      value={formData.nameArabic}
                      onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                      placeholder="e.g., عسل، زيوت، أملو"
                      dir="rtl"
                      className="border-[#e9e6dd] focus:border-[#556B2F] focus:ring-[#556B2F] font-arabic"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                      placeholder="e.g., honey, oils, amlou (auto-generated from name)"
                      className="border-[#e9e6dd] focus:border-[#556B2F] focus:ring-[#556B2F]"
                    />
                    <p className="text-xs text-muted-foreground">This will appear in the URL: /category/{formData.slug || 'your-slug'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Category Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="e.g., /honey-category.jpg or https://example.com/image.jpg"
                      className="border-[#e9e6dd] focus:border-[#556B2F] focus:ring-[#556B2F]"
                    />
                    <p className="text-xs text-muted-foreground">Image shown in category cards on homepage</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the category..."
                      rows={4}
                      className="border-[#e9e6dd] focus:border-[#556B2F] focus:ring-[#556B2F]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Category
                      </>
                    )}
                  </Button>
                  <Link href="/admin/categories">
                    <Button type="button" variant="outline" className="border-[#556B2F]/30">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
