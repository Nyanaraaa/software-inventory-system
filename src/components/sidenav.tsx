"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"

import { useState } from "react"

import { usePathname } from "next/navigation"

import type React from "react"

import { Clock, Database, LayoutDashboard, Users, Key } from "lucide-react"
import CreateItemModal from "@/components/add-item-modal"
import AddKeysModal from "@/components/add-keys-modal"
import AddVendorModal from "@/components/add-vendor-modal"

export function SideNav({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const [isAddKeysOpen, setIsAddKeysOpen] = useState(false)
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)

  return (
    <nav className={cn("flex flex-col space-y-1 border-r bg-background p-4", className)}>
      <div className="py-2">
        <h2 className="mb-3 px-2 text-lg font-semibold tracking-tight">Dashboard</h2>
        <div className="space-y-1">
          <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-5 w-5 text-primary" />
              Inventory Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="py-2">
        <h2 className="mb-3 px-2 text-lg font-semibold tracking-tight">Database</h2>
        <div className="space-y-1">
          <Button variant={pathname === "/inventory" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
            <Link href="/inventory">
              <Database className="mr-2 h-5 w-5 text-primary" />
              Product Database
            </Link>
          </Button>

          <Button variant={pathname === "/licenses" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
            <Link href="/keys">
              <Key className="mr-2 h-5 w-5 text-primary" />
              License Key Database
            </Link>
          </Button>

          <Button variant={pathname === "/vendors" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
            <Link href="/vendors">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Vendor Database
            </Link>
          </Button>

          <Button variant={pathname === "/renewals" ? "secondary" : "ghost"} className="w-full justify-start" asChild>
            <Link href="/renewals">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Renewal Database
            </Link>
          </Button>
        </div>
      </div>

      <div className="py-2">
        <h2 className="mb-3 px-2 text-lg font-semibold tracking-tight">Forms</h2>
        <div className="space-y-1">
          <CreateItemModal updateData={() => {}} />

          <Button variant="ghost" className="w-full justify-start" onClick={() => setIsAddKeysOpen(true)}>
            <Key className="mr-2 h-5 w-5 text-primary" />
            Add License Key
          </Button>

          <AddKeysModal open={isAddKeysOpen} onClose={() => setIsAddKeysOpen(false)} />

          <Button variant="ghost" className="w-full justify-start" onClick={() => setIsAddVendorOpen(true)}>
            <Users className="mr-2 h-5 w-5 text-primary" />
            Add Vendor
          </Button>

          <AddVendorModal open={isAddVendorOpen} onClose={() => setIsAddVendorOpen(false)} />
        </div>
      </div>
    </nav>
  )
}
