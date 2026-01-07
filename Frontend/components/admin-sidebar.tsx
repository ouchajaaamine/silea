"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: FolderTree, label: "Categories", href: "/admin/categories" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
]

interface AdminSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full bg-white border-r border-[#556B2F]/10 flex flex-col shadow-xl">
          {/* Logo Section */}
          <div className="p-6 border-b border-[#556B2F]/5">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#556B2F] to-[#6B8E23] flex items-center justify-center shadow-lg shadow-[#556B2F]/20">
                <img src="/logo.png" alt="Silea" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold text-[#556B2F]">Silea</h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#556B2F]/40">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white shadow-lg shadow-[#556B2F]/25"
                      : "text-[#556B2F]/70 hover:bg-[#556B2F]/5 hover:text-[#556B2F]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-[#556B2F]/5">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}

