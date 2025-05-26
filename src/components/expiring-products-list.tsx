"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import DetailsModal from "@/components/item-details-modal"

type ExpiringProduct = {
  id: number
  name: string
  expirationDate?: Date | null
  itemType: string
  owner: string
}

export function ExpiringProductsList({ items }: { items: ExpiringProduct[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="rounded-full bg-green-50 p-3 mb-3">
          <Clock className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-900">No expiring products</h3>
        <p className="text-sm text-gray-500 mt-1">All your products are up to date</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const expiration = item.expirationDate ? new Date(item.expirationDate) : null
        const daysLeft = expiration ? Math.ceil((expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

        let statusColor = "bg-green-50 text-green-700"
        let icon = <Clock className="h-5 w-5 text-green-500" />
        let badgeVariant: "default" | "outline" | "destructive" | "warning" | "secondary" | undefined = "outline"

        if (daysLeft !== null) {
          if (daysLeft < 0) {
            statusColor = "bg-red-50 text-red-700"
            icon = <AlertCircle className="h-5 w-5 text-red-500" />
            badgeVariant = "destructive"
          } else if (daysLeft <= 7) {
            statusColor = "bg-red-50 text-red-700"
            icon = <AlertCircle className="h-5 w-5 text-red-500" />
            badgeVariant = "destructive"
          } else if (daysLeft <= 14) {
            statusColor = "bg-amber-50 text-amber-700"
            icon = <Clock className="h-5 w-5 text-amber-500" />
            badgeVariant = "warning"
          }
        }

        return (
          <div
            key={item.id}
            className="flex items-start space-x-4 rounded-lg border p-4 transition-all hover:bg-gray-50"
          >
            <div className={`rounded-full ${statusColor} p-2 mt-0.5`}>{icon}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  <DetailsModal id={item.id}>
                    <button className="text-blue-600 hover:underline font-medium">{item.name}</button>
                  </DetailsModal>
                </p>
                <Badge
                  variant={badgeVariant}
                  className={
                    badgeVariant === "destructive"
                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                      : badgeVariant === "warning"
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        : "bg-green-100 text-green-800 hover:bg-green-100"
                  }
                >
                  {daysLeft !== null
                    ? daysLeft < 0
                      ? "Expired"
                      : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                    : "No Expiry"}
                </Badge>
              </div>
              <div className="flex items-center text-xs text-gray-500 space-x-2">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {expiration
                    ? expiration.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "No expiration date"}
                </span>
                <span>•</span>
                <span>{item.owner}</span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="pt-2 text-center">
        <Link href="/dashboard?tab=expiring" passHref>
          <Button variant="link" size="sm" className="text-xs">
            View all expiring products
          </Button>
        </Link>
      </div>
    </div>
  )
}
