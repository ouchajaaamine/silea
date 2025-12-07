"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Menu, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { categoriesApi, type Category } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { toast } from "sonner"

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("silea_token")
    if (!token) {
      router.push("/admin")
      return
    }

    const fetchData = async () => {
      try {
        const data = await categoriesApi.getAll()
        setCategories(data || [])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      await categoriesApi.delete(id)
      setCategories(categories.filter((c) => c.id !== id))
      toast.success("Category deleted")
    } catch (error) {
      console.error("Delete failed:", error)
      toast.error("Failed to delete category")
    }
  }

  const handleToggleActive = async (id: number, current: boolean) => {
    try {
      await categoriesApi.updateStatus(id, !current)
      setCategories(categories.map((c) => (c.id === id ? { ...c, active: !current } : c)))
      toast.success("Category status updated")
    } catch (error) {
      console.error("Status update failed:", error)
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 glass-card border-b border-white/20 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl font-bold">Categories</h1>
                <p className="text-sm text-muted-foreground">Manage your categories</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/admin/categories/new">
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Card className="glass-card">
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Arabic Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell>{cat.id}</TableCell>
                          <TableCell>{cat.name}</TableCell>
                          <TableCell dir="rtl">{cat.nameAr}</TableCell>
                          <TableCell>
                            {cat.active ? <Badge className="bg-[#556B2F]">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/categories/${cat.id}`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(cat.id, cat.active)}>
                                  {cat.active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(cat.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
