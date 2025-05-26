"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Phone, Mail, CheckCircle2, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { createVendor } from "@/actions/vendors" // Import your backend function
import { toast } from "sonner" // If you use sonner for notifications

export default function AddVendorModal({
  open,
  onClose,
  itemId, // Pass itemId if you want to link vendor to an item
}: {
  open: boolean
  onClose: () => void
  itemId?: number
}) {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; contact?: string; email?: string }>({})
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: { name?: string; contact?: string; email?: string } = {}
    let isValid = true

    if (!name.trim()) {
      newErrors.name = "Vendor name is required"
      isValid = false
    }

    if (!contact.trim()) {
      newErrors.contact = "Contact number is required"
      isValid = false
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(contact)) {
      newErrors.contact = "Please enter a valid phone number"
      isValid = false
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await createVendor({ name, contact, email })
      setSuccess(true)
      setName("")
      setContact("")
      setEmail("")
      setErrors({})
      // Optionally close after a delay
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1000)
    } catch (err: any) {
      setError("Failed to add vendor.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            Add Vendor
          </DialogTitle>
          <DialogDescription>
            Add a new vendor to your system. Vendors are companies or individuals that supply products to your business.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="vendor-name" className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Vendor Name
            </Label>
            <Input
              id="vendor-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors({ ...errors, name: undefined })
              }}
              placeholder="Enter vendor name"
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-contact" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Contact Number
            </Label>
            <Input
              id="vendor-contact"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value)
                if (errors.contact) setErrors({ ...errors, contact: undefined })
              }}
              placeholder="Enter contact number"
              className={cn(errors.contact && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.contact && <p className="text-xs text-destructive mt-1">{errors.contact}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="vendor-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              placeholder="Enter email address"
              className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Vendor added successfully!
              </div>
            </div>
          )}

          {name && contact && email && !Object.keys(errors).length && (
            <div className="rounded-md p-3 bg-green-50 border border-green-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Vendor details look good</div>
                  <div className="text-sm text-green-700">
                    You're ready to add {name} as a new vendor to your system.
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="min-w-[120px]">
              {saving ? "Adding..." : "Add Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
