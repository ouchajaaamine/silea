"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users,
  Menu,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  AlertCircle,
  Star,
  UserCheck,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { customersApi, type Customer } from "@/lib/api"
import { AdminSidebar } from "@/components/admin-sidebar"
import { toast } from "sonner"

type FilterType = "with-orders" | "at-risk" | "vip" | "all"
const FILTER_LABELS: Record<FilterType, string> = {
  "with-orders": "customers with orders",
  "at-risk": "at-risk customers",
  vip: "VIP customers",
  all: "all customers",
}

type SegmentStats = {
  customersWithOrders: number
  atRiskCustomers: number
  repeatCustomers: number
  newCustomers: number
  totalCustomers: number
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>("with-orders")
  const [searchQuery, setSearchQuery] = useState("")
  const [segments, setSegments] = useState<SegmentStats | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'NEW' | 'VIP' | undefined>(undefined)
  const [fromDate, setFromDate] = useState<string | undefined>(undefined)
  const [toDate, setToDate] = useState<string | undefined>(undefined)
  const [minSpent, setMinSpent] = useState<number | undefined>(undefined)
  const [maxSpent, setMaxSpent] = useState<number | undefined>(undefined)
  const [minOrders, setMinOrders] = useState<number | undefined>(undefined)
  const [maxOrders, setMaxOrders] = useState<number | undefined>(undefined)

  useEffect(() => {
    const token = localStorage.getItem("silea_token")
    if (!token) {
      router.push("/admin")
      return
    }

    fetchCustomers()
    fetchSegments()
  }, [router])

  const fetchSegments = async () => {
    try {
      const data = await customersApi.getSegments()
      setSegments(data as SegmentStats)
    } catch (error) {
      console.error("Failed to fetch segments", error)
    }
  }

  const fetchCustomers = async (type: FilterType = filterType) => {
    try {
      setLoading(true)
      let data: Customer[] = []

      switch (type) {
        case "all": {
          const res = await customersApi.getAll()
          // `getAll()` may return an object with a `customers` array or directly an array
          if (Array.isArray(res)) {
            data = res as Customer[]
          } else if (res && typeof res === 'object' && Array.isArray((res as any).customers)) {
            data = (res as any).customers as Customer[]
          } else {
            data = []
          }
          break
        }
        case "with-orders":
          data = await customersApi.getWithOrders()
          break
        case "at-risk":
          data = await customersApi.getAtRisk(60)
          break
        case "vip":
          data = await customersApi.getVip(1000)
          break
        default:
          data = await customersApi.getWithOrders()
      }

      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers", error)
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type)
    fetchCustomers(type)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return
    }

    try {
      await customersApi.delete(id)
      setCustomers((prev) => prev.filter((c) => c.id !== id))
      toast.success("Customer deleted")
    } catch (error) {
      console.error("Failed to delete customer", error)
      toast.error("Failed to delete customer")
    }
  }

  const handleApplyFilters = async () => {
    try {
      setLoading(true)
      const data = await customersApi.filter({
        status: statusFilter,
        fromDate,
        toDate,
        minSpent,
        maxSpent,
        minOrders,
        maxOrders,
      })
      setCustomers(data)
      setFilterType('all')
      toast.success(`Applied filters`)
    } catch (error) {
      console.error('Failed to apply filters', error)
      toast.error('Failed to apply filters')
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    // format yyyy-mm-dd
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    setFromDate(fmt(from))
    setToDate(fmt(to))
  }

  const downloadCSV = () => {
    const list = filteredCustomers
    if (!list.length) {
      toast.error("No customers to export")
      return
    }

    const headers = [
      "id",
      "name",
      "email",
      "phone",
      "address",
      "totalOrders",
      "totalSpent",
      "lastOrderDate",
      "status",
      "createdAt",
    ]

    const escapeValue = (val: unknown) => {
      if (val === null || val === undefined) {
        return ""
      }
      const str = String(val)
      return `"${str.replace(/"/g, '""')}"`
    }

    const rows = list.map((customer) =>
      headers.map((header) => escapeValue((customer as any)[header])).join(",")
    )

    // Use CRLF for Windows/Excel compatibility and add UTF-8 BOM
    const bom = "\uFEFF"
    const csvContent = [headers.join(","), ...rows].join("\r\n")
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `customers_${filterType}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${list.length} customers`)
  }

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers
    }

    const normalized = searchQuery.trim().toLowerCase()
    return customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(normalized)
      const emailMatch = customer.email?.toLowerCase().includes(normalized)
      const phoneMatch = customer.phone?.includes(searchQuery.trim())
      return Boolean(nameMatch || emailMatch || phoneMatch)
    })
  }, [customers, searchQuery])

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      NEW: "bg-blue-100 text-blue-800",
      VIP: "bg-purple-100 text-purple-800",
    }

    return statusColors[status] || "bg-gray-100 text-gray-800"
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
                <h1 className="font-serif text-2xl font-bold">Customer Management</h1>
                <p className="text-sm text-muted-foreground">
                  Viewing {filteredCustomers.length} {FILTER_LABELS[filterType]}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={downloadCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Link href="/admin/customers/new">
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 space-y-6">
          {segments && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">With Orders</p>
                      <p className="text-2xl font-bold">{segments.customersWithOrders}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-[#556B2F]" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">At Risk</p>
                      <p className="text-2xl font-bold text-orange-600">{segments.atRiskCustomers}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Repeat (3+)</p>
                      <p className="text-2xl font-bold text-blue-600">{segments.repeatCustomers}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">New (30d)</p>
                      <p className="text-2xl font-bold text-green-600">{segments.newCustomers}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{segments.totalCustomers}</p>
                    </div>
                    <Star className="w-8 h-8 text-[#D6A64F]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Essential Customer Segments
              </CardTitle>
              <CardDescription>
                Stick to the four highest-signal lists for quick retargeting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === "with-orders" ? "default" : "outline"}
                  onClick={() => handleFilterChange("with-orders")}
                  className={filterType === "with-orders" ? "bg-[#556B2F]" : ""}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  With Orders
                </Button>
                <Button
                  variant={filterType === "at-risk" ? "default" : "outline"}
                  onClick={() => handleFilterChange("at-risk")}
                  className={filterType === "at-risk" ? "bg-orange-600" : ""}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  At Risk (60d+)
                </Button>
                <Button
                  variant={filterType === "vip" ? "default" : "outline"}
                  onClick={() => handleFilterChange("vip")}
                  className={filterType === "vip" ? "bg-purple-600" : ""}
                >
                  <Star className="w-4 h-4 mr-2" />
                  VIP (1000+ MAD)
                </Button>
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => handleFilterChange("all")}
                >
                  All Customers
                </Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Presets:</span>
                  </div>
                  <Button variant={fromDate && toDate ? 'outline' : 'ghost'} onClick={() => { setFromDate(undefined); setToDate(undefined); setMinSpent(undefined); setMaxSpent(undefined); setMinOrders(undefined); setMaxOrders(undefined); setStatusFilter(undefined); fetchCustomers(); }}>
                    Clear All
                  </Button>
                  <Button onClick={() => applyPreset(30)} variant="outline">Last 30d</Button>
                  <Button onClick={() => applyPreset(60)} variant="outline">Last 60d</Button>
                  <Button onClick={() => applyPreset(90)} variant="outline">Last 90d</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <div className="md:col-span-1">
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor="fromDate">From</Label>
                    <Input id="fromDate" type="date" value={fromDate || ''} onChange={(e) => setFromDate(e.target.value || undefined)} />
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor="toDate">To</Label>
                    <Input id="toDate" type="date" value={toDate || ''} onChange={(e) => setToDate(e.target.value || undefined)} />
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor="minSpent">Min Spent</Label>
                    <Input id="minSpent" type="number" value={minSpent ?? ''} onChange={(e) => setMinSpent(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor="maxSpent">Max Spent</Label>
                    <Input id="maxSpent" type="number" value={maxSpent ?? ''} onChange={(e) => setMaxSpent(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor="minOrders">Min Orders</Label>
                    <Input id="minOrders" type="number" value={minOrders ?? ''} onChange={(e) => setMinOrders(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters} className="bg-[#556B2F]">
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setStatusFilter(undefined)
                    setFromDate(undefined)
                    setToDate(undefined)
                    setMinSpent(undefined)
                    setMaxSpent(undefined)
                    setMinOrders(undefined)
                    setMaxOrders(undefined)
                    fetchCustomers()
                  }}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No customers found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>{customer.id}</TableCell>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{customer.totalOrders || 0}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {typeof customer.totalSpent === "number"
                                ? customer.totalSpent.toFixed(2)
                                : customer.totalSpent || "0.00"}{" "}
                              MAD
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {customer.lastOrderDate
                                ? new Date(customer.lastOrderDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(customer.status)}>{customer.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/customers/${customer.id}`}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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
