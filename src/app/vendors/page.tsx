"use client"

import type React from "react"
import * as XLSX from "xlsx"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Building2, Plus, Mail, Phone } from "lucide-react"
import Link from "next/link"
import AddVendorModal from "@/components/add-vendor-modal"
import EditVendorModal from "@/components/edit-vendor-modal"

function VendorsTable({ query, page, status }: { query?: string; page?: string; status?: string }) {
  const [vendors, setVendors] = useState<any[]>([])
  const [allVendors, setAllVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState(query || "")

  // Fetch all vendors once for client-side search
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    fetch(`/api/vendors?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setAllVendors(data.vendors)
        setLoading(false)
      })
  }, [status])

  // Filter vendors on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setVendors(allVendors)
      setTotalCount(allVendors.length)
      setTotalPages(Math.ceil(allVendors.length / itemsPerPage))
      return
    }
    const lower = searchQuery.toLowerCase()
    const filtered = allVendors.filter(
      (vendor: any) =>
        vendor.name.toLowerCase().includes(lower) ||
        (vendor.contact && vendor.contact.toLowerCase().includes(lower)) ||
        (vendor.email && vendor.email.toLowerCase().includes(lower))
    )
    setVendors(filtered)
    setTotalCount(filtered.length)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
  }, [searchQuery, allVendors])

  // Pagination
  const paginatedVendors = vendors.slice(
    ((Number(page) || 1) - 1) * itemsPerPage,
    (Number(page) || 1) * itemsPerPage
  )

  // Add handleSearch function
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Function to update vendor via API
  async function handleSaveVendor(updatedVendor: any) {
    await fetch(`/api/vendors`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedVendor),
    })
    setSelectedVendor(null)
    setEditModalOpen(false)
    // Reload data
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.append("query", query)
    if (page) params.append("page", page)
    fetch(`/api/vendors?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setVendors(data.vendors)
        setTotalCount(data.totalCount)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
  }

  // Export all vendors to Excel
  const handleExport = async () => {
    // Fetch all vendors (not just current page)
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    // Remove pagination for export
    const res = await fetch(`/api/vendors?${params.toString()}`)
    const data = await res.json()
    const allVendors = data.vendors

    // Prepare data for Excel
    const rows = allVendors.map((vendor: any) => ({
      Name: vendor.name,
      Contact: vendor.contact,
      Email: vendor.email,
      Status: vendor.status,
      Items: vendor.items?.map((item: any) => item.name).join(", "),
    }))

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors")

    // Export to Excel file
    XLSX.writeFile(workbook, "vendors.xlsx")
  }

  function renderRows(data: any[]) {
    if (loading) {
      // Render skeleton rows
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell colSpan={5}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </TableRow>
      ))
    }
    if (data.length === 0) {
      return (
        <TableRow key="empty">
          <TableCell colSpan={5} className="h-32 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Building2 className="h-8 w-8 mb-2 opacity-40" />
              <p>No vendors found</p>
              {query && <p className="text-sm mt-1">Try adjusting your search or filters</p>}
            </div>
          </TableCell>
        </TableRow>
      )
    }
    return data.map((vendor) => (
      <TableRow key={vendor.id} className="group hover:bg-muted/50 transition-colors">
        <TableCell>
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">{vendor.name}</div>
              {vendor.items && vendor.items.length > 0 && (
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-1">
                  {vendor.items.slice(0, 2).map((item: any, index: number) => (
                    <Badge key={index} variant="outline" className="font-normal">
                      {item.name}
                    </Badge>
                  ))}
                  {vendor.items.length > 2 && (
                    <Badge variant="outline" className="font-normal">
                      +{vendor.items.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {vendor.contact ? (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{vendor.contact}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          {vendor.email ? (
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{vendor.email}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setSelectedVendor(vendor)
                setEditModalOpen(true)
              }}
              title="Edit Vendor"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.33168 11.3754 6.42164 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42161 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42161 9.28547Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Edit vendor</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {vendors.length} of {allVendors.length} vendors
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-4 w-full max-w-md">
        <div className="relative">
          <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M16.65 10.65A5.985 5.985 0 0018 12a5.978 5.978 0 00-1.35-1.35M12 18a6 6 0 110-12 6 6 0 010 12z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search vendors..."
            className="w-full pl-8 pr-4 py-2 rounded-md border focus:ring-1 focus:ring-primary focus:outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40%]">Vendor Name</TableHead>
              <TableHead className="w-[25%]">Contact Number</TableHead>
              <TableHead className="w-[25%]">Email</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderRows(paginatedVendors)}</TableBody>
        </Table>
      </div>

      {selectedVendor && (
        <EditVendorModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          vendor={selectedVendor}
          onSave={handleSaveVendor}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button variant="outline" size="sm" disabled={Number(page) === 1} asChild className="h-9 px-4">
            <Link
              href={{
                pathname: "/vendors",
                query: {
                  ...(query ? { query } : {}),
                  page: Number(page) - 1,
                },
              }}
            >
              Previous
            </Link>
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={Number(page) === pageNum ? "default" : "outline"}
                size="sm"
                className={`h-9 w-9 ${Number(page) === pageNum ? "pointer-events-none" : ""}`}
                asChild={Number(page) !== pageNum}
              >
                {Number(page) !== pageNum ? (
                  <Link
                    href={{
                      pathname: "/vendors",
                      query: {
                        ...(query ? { query } : {}),
                        page: pageNum,
                      },
                    }}
                  >
                    {pageNum}
                  </Link>
                ) : (
                  pageNum
                )}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" disabled={Number(page) === totalPages} asChild className="h-9 px-4">
            <Link
              href={{
                pathname: "/vendors",
                query: {
                  ...(query ? { query } : {}),
                  page: Number(page) + 1,
                },
              }}
            >
              Next
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}

export default function VendorDatabasePage() {
  const searchParams = useSearchParams()
  const query = searchParams?.get("query") || ""
  const currentPage = searchParams?.get("page") || "1"
  const [addModalOpen, setAddModalOpen] = useState(false)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Vendor Database</h1>
              <p className="text-muted-foreground mt-1">Manage and track all your vendors in one place</p>
            </div>
          </div>

          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
            value={activeTab}
          >
            <div className="border-b">
              <div className="flex items-center justify-between">
                <TabsList className="h-10">
                  <TabsTrigger value="all" className="text-sm">
                    All Vendors
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-sm">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="inactive" className="text-sm">
                    Inactive
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <VendorsTable query={query} page={currentPage} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="active" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <VendorsTable query={query} page={currentPage} status="ACTIVE" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inactive" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <VendorsTable query={query} page={currentPage} status="INACTIVE" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
