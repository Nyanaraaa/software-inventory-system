"use client"

import { useState, useEffect } from "react"
import { getItem } from "@/actions/items"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import LicenseKeysModal from "@/components/license-keys-modal"
import { Eye, User, Mail, Tag, Calendar, Key, Hash, FileText, Clock, Package, AlertCircle, ExternalLink, Building2, Phone, Mail as MailIcon } from 'lucide-react'

export default function DetailsModal({ id, children }: { id: number; children?: React.ReactNode }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await getItem(id)
        setData(res)
        setError(null)
      } catch (err) {
        setError("Failed to load item details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getExpirationStatus = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return null
    const now = new Date()
    const expDate = new Date(expirationDate)
    
    if (expDate < now) {
      return { label: "Expired", variant: "destructive" as const }
    }
    
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)
    if (expDate < thirtyDaysFromNow) {
      return { label: "Expiring Soon", variant: "warning" as const }
    }
    
    return { label: "Active", variant: "default" as const }
  }

  const expirationStatus = data?.expirationDate ? getExpirationStatus(data.expirationDate) : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {loading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <>
                <span>Item Details</span>
                {data?.itemType && (
                  <Badge
                    variant={data.itemType === "SOFTWARE" ? "default" : "secondary"}
                    className={`ml-2 ${
                      data.itemType === "SOFTWARE" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                    }`}
                  >
                    {data.itemType}
                  </Badge>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-gray-700">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>Product Name</span>
                  </div>
                  <p className="font-medium text-gray-900">{data.name}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>Owner</span>
                  </div>
                  <p className="font-medium text-gray-900">{data.owner}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Owner Email</span>
                  </div>
                  <p className="font-medium text-gray-900">{data.ownerEmail || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Hash className="h-4 w-4 mr-2" />
                    <span>Requisition Number</span>
                  </div>
                  <p className="font-medium text-gray-900">{data.requisitionNumber || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Dates & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.itemType === "HARDWARE" && (
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Purchase Date</span>
                    </div>
                    <p className="font-medium text-gray-900">{formatDate(data.purchaseDate)}</p>
                  </div>
                )}

                {data.itemType === "SOFTWARE" && (
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Subscription Date</span>
                    </div>
                    <p className="font-medium text-gray-900">{formatDate(data.subscriptionDate)}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Expiration Date</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{formatDate(data.expirationDate)}</p>
                    {typeof data?.archived === "boolean" && (
                      <Badge
                        variant={data.archived ? "destructive" : "default"}
                        className={`ml-2 ${
                          data.archived
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : "bg-green-100 text-green-800 hover:bg-green-100"
                        }`}
                      >
                        {data.archived ? "Inactive" : "Active"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {data.itemType === "SOFTWARE" && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">License Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Key className="h-4 w-4 mr-2" />
                      <span>License Keys</span>
                    </div>
                    <div>
                      {data.licenseKeys && data.licenseKeys.length > 0 ? (
                        <div className="flex items-center">
                          <LicenseKeysModal licenseKeys={data.licenseKeys} productName={data.name} />
                          <Badge className="ml-2 bg-gray-100 text-gray-800 hover:bg-gray-100">
                            {data.licenseKeys.length} {data.licenseKeys.length === 1 ? "key" : "keys"}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-500">No license keys available</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Package className="h-4 w-4 mr-2" />
                      <span>Number of Licenses</span>
                    </div>
                    <p className="font-medium text-gray-900">{data.numberOfLicenses || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vendor Information
              </h3>
              {data.vendor ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>Name</span>
                    </div>
                    <p className="font-medium text-gray-900">{data.vendor.name}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>Contact Number</span>
                    </div>
                    <p className="font-medium text-gray-900">{data.vendor.contact}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MailIcon className="h-4 w-4 mr-2" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium text-gray-900">{data.vendor.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No vendor assigned.</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FileText className="h-4 w-4 mr-2" />
                <span>Description</span>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{data.description || "No description provided."}</p>
            </div>

            {data.attachment && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>Attachment</span>
                </div>
                <a
                  href={data.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Attachment
                </a>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
