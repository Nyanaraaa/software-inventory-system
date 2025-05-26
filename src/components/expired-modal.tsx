"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, Search, Clock, Calendar, User, Package, X, AlertTriangle } from "lucide-react"
import DetailsModal from "@/components/item-details-modal"

// Types for better type safety
interface ExpiredProduct {
  id: number
  name: string
  expirationDate: string
  owner: string
  daysExpired?: number
}

// Fetch expired products from the backend API
async function fetchExpiredProducts(): Promise<ExpiredProduct[]> {
  const res = await fetch("/api/expired-products")
  if (!res.ok) throw new Error("Failed to fetch expired products")
  return res.json()
}

// Renew product API call
async function renewProduct(id: number) {
  // TODO: Implement renew logic
  return Promise.resolve()
}

export default function ExpiredProductsModal() {
  const [open, setOpen] = useState(false)
  const [expiredProducts, setExpiredProducts] = useState<ExpiredProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ExpiredProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [renewingId, setRenewingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Calculate days since expiration for each product
  const processProducts = (products: ExpiredProduct[]): ExpiredProduct[] => {
    return products.map((product) => {
      const expirationDate = new Date(product.expirationDate)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - expirationDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return {
        ...product,
        daysExpired: diffDays,
      }
    })
  }

  // Fetch products when modal opens
  useEffect(() => {
    if (open) {
      loadProducts()
    }
  }, [open])

  // Filter products when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(expiredProducts)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredProducts(
        expiredProducts.filter(
          (product) => product.name.toLowerCase().includes(query) || product.owner.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, expiredProducts])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await fetchExpiredProducts()
      const processed = processProducts(data)
      setExpiredProducts(processed)
      setFilteredProducts(processed)
    } catch (error) {
      console.error("Failed to load expired products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const handleRenew = async (id: number) => {
    setRenewingId(id)
    try {
      await renewProduct(id)
      await loadProducts()
    } catch (error) {
      console.error("Failed to renew product:", error)
    } finally {
      setRenewingId(null)
    }
  }

  // Get expiration severity based on days expired
  const getExpirationSeverity = (days?: number) => {
    if (!days) return "default"
    if (days > 30) return "destructive"
    if (days > 14) return "warning"
    return "default"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className="flex items-center gap-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>View expired products</span>
      </Button>

      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div className="flex flex-col">
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Expired Products
            </DialogTitle>
            <p className="text-muted-foreground text-sm mt-1">Review and renew products that have expired</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or owners..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1.5 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Product Name</span>
                  </div>
                </TableHead>
                <TableHead className="w-[25%]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Expiration Date</span>
                  </div>
                </TableHead>
                <TableHead className="w-[20%]">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Owner</span>
                  </div>
                </TableHead>
                {/* Removed Action column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    {/* Removed Action cell */}
                  </TableRow>
                ))
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Clock className="h-8 w-8 mb-2" />
                      {searchQuery ? (
                        <>
                          <p>No products match your search</p>
                          <Button variant="link" className="mt-1 h-auto p-0" onClick={() => setSearchQuery("")}>
                            Clear search
                          </Button>
                        </>
                      ) : (
                        <p>No expired products found</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <DetailsModal id={item.id}>
                        <span className="text-blue-600 hover:underline cursor-pointer">{item.name}</span>
                      </DetailsModal>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : "N/A"}</span>
                        {item.daysExpired && (
                          <Badge variant={getExpirationSeverity(item.daysExpired) as any} className="w-fit mt-1">
                            {item.daysExpired} days ago
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.owner}</TableCell>
                    {/* Removed Action cell */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {!loading && filteredProducts.length > 0 && (
              <span>
                Showing {filteredProducts.length} expired product{filteredProducts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
