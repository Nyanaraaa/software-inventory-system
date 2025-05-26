"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

type LicenseKey = {
  key: string
  status: string
}

export default function LicenseKeysModal({
  licenseKeys,
  productName,
}: {
  licenseKeys: LicenseKey[]
  productName: string
}) {
  const [open, setOpen] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        <span>View Keys ({licenseKeys.length})</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span>License Keys</span>
              <Badge variant="outline" className="ml-2 font-normal text-xs">
                {productName}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto py-2 flex-grow">
            {licenseKeys.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        License Key
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {licenseKeys.map((lk, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <code className="font-mono text-sm bg-gray-100 p-1.5 rounded">{lk.key}</code>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={lk.status === "active" ? "default" : "destructive"}
                            className={cn(
                              "font-normal",
                              lk.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100",
                            )}
                          >
                            {lk.status === "active" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                            )}
                            {lk.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(lk.key, idx)}
                            className="h-8 px-2 text-gray-500 hover:text-gray-700"
                          >
                            {copiedIndex === idx ? (
                              <span className="text-green-600 text-xs font-medium">Copied!</span>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">Copy</span>
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No license keys available for this product.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="bg-gray-900 hover:bg-gray-800 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
