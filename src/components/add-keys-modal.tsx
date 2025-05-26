"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, Combobox } from "@headlessui/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getItems } from "@/actions/items"
import prisma from "@/lib/prisma"
import { Key, Check, AlertCircle } from "lucide-react"

type ItemOption = {
  id: number
  name: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddKeysModal({ open, onClose, onSuccess }: Props) {
  const [licenseKey, setLicenseKey] = useState("")
  const [status, setStatus] = useState("active")
  const [productId, setProductId] = useState<number | null>(null)
  const [items, setItems] = useState<ItemOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    async function fetchItems() {
      const res = await getItems(0, 1000)
      setItems(res.map((item: any) => ({ id: item.id, name: item.name })))
    }
    if (open) fetchItems()
  }, [open])

  const filteredItems =
    query === "" ? items : items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    if (!licenseKey || !productId) {
      setError("Please enter a license key and select a product.")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/license-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: licenseKey,
          status,
          itemId: productId,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to add license key.")
      }
      setSuccess(true)
      setLicenseKey("")
      setProductId(null)
      setStatus("active")
      if (onSuccess) onSuccess()
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Failed to add license key. It may already exist.")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10">
          <div className="flex items-center justify-between border-b p-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Add License Key</Dialog.Title>
            <Key className="h-5 w-5 text-primary" />
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <Combobox value={productId} onChange={setProductId}>
                <div className="relative">
                  <Combobox.Input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    displayValue={(id: number) => items.find((item) => item.id === id)?.name || ""}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search product..."
                    required
                  />
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {filteredItems.length === 0 && query !== "" ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        No products found.
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item.id}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? "bg-primary/10 text-primary" : "text-gray-700"
                            }`
                          }
                        >
                          {item.name}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">License Key</label>
              <Input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                required
                placeholder="Enter license key"
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                  License key added successfully!
                </div>
              </div>
            )}
          </form>

          <div className="flex justify-end gap-3 border-t p-4">
            <Button type="button" onClick={onClose} variant="outline" className="text-gray-700">
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? "Adding..." : "Add Key"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
