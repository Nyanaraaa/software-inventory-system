"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Key } from "lucide-react"
import React, { useState } from "react"

export default function EditLicenseStatusModal({
  open,
  onClose,
  licenseKey,
  onSave,
}: {
  open: boolean
  onClose: () => void
  licenseKey: any
  onSave: (status: string) => Promise<void>
}) {
  const [status, setStatus] = useState(licenseKey?.status || "active")
  const [saving, setSaving] = useState(false)

  // Update status when modal opens for a new licenseKey
  React.useEffect(() => {
    setStatus(licenseKey?.status || "active")
  }, [licenseKey])

  if (!licenseKey) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Edit License Key Status
          </DialogTitle>
          <DialogDescription>Change the status of this license key to control its validity.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* License Key Info */}
          <div className="mb-6 p-3 bg-muted/50 rounded-lg border">
            <div className="text-xs text-muted-foreground mb-1">License Key</div>
            <div className="font-mono text-sm font-medium">{licenseKey.key}</div>
            {licenseKey.item && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Product</div>
                <div className="text-sm font-medium">{licenseKey.item.name}</div>
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">License Status</label>
              <Select value={status} onValueChange={setStatus} disabled={saving}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Active</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Inactive</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setSaving(true)
              await onSave(status)
              setSaving(false)
              onClose()
            }}
            disabled={saving}
            className="min-w-[100px]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
