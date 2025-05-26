"use client"

import { useRef, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getItems, archiveItem, unarchiveItem, renewItem } from "@/actions/items";
import { truncate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { DisplayedItems } from "@/lib/types";
import * as XLSX from "xlsx"
import { Dialog } from "@headlessui/react"
import { ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react"

// Import components
import CreateItemModal from "@/components/add-item-modal";
import EditItemModal from "@/components/edit-item-modal";
import DetailsModal from "@/components/item-details-modal";
import LicenseKeysModal from "@/components/license-keys-modal";
import RenewModal from "@/components/renew-modal";

// Import icons
import {
  ArrowLeft,
  Download,
  Archive,
  ArchiveRestore,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"

export default function HomeContent() {
  const searchParams = useSearchParams()
  const page = Number.parseInt(searchParams?.get("page") ?? "1") - 1
  const now = new Date()
  const [data, setData] = useState<DisplayedItems[]>([])
  const [displayData, setDisplayData] = useState<DisplayedItems[]>([])
  const [archivedData, setArchivedData] = useState<DisplayedItems[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent")
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showExportOptions, setShowExportOptions] = useState(false)
  const exportOptionsRef = useRef<HTMLDivElement>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "name",
    "owner",
    "purchaseDate",
    "subscriptionDate",
    "expirationDate",
    "type",
  ])
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<DisplayedItems | null>(null)
  const [newSubscriptionDate, setNewSubscriptionDate] = useState<Date | null>(null)
  const [newPurchaseDate, setNewPurchaseDate] = useState<Date | null>(null)
  const [newExpirationDate, setNewExpirationDate] = useState<Date | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 20

  const fields = [
    { key: "name", label: "Product Name" },
    { key: "owner", label: "Owner" },
    { key: "ownerEmail", label: "Owner Email" },
    { key: "licenseKey", label: "License Key" },
    { key: "numLicenses", label: "Number of Licenses" },
    { key: "requisitionNumber", label: "Requisition Number" },
    { key: "attachment", label: "Attachment" },
    { key: "description", label: "Description" },
    { key: "purchaseDate", label: "Purchase Date (Hardware)" },
    { key: "subscriptionDate", label: "Subscription Date (Software)" },
    { key: "expirationDate", label: "Expiration" },
    { key: "type", label: "Type" },
  ]

  const textDateColor = (date: Date | null | undefined) => {
    if (!date) return "text-gray-500"
    if (date < now) return "text-red-500 font-medium"
    if (date < new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)) {
      return "text-amber-500 font-medium"
    }
    return "text-green-600"
  }

  const updateData = async () => {
    const res = await getItems(0, 1000)
    const temp = res.map((e) => ({
      id: e.id,
      name: e.name,
      owner: e.owner,
      ownerEmail: e.ownerEmail ?? undefined,
      licenseKey: e.licenseKeys.map((key: any) => key.key).join(", ") ?? undefined,
      licenseKeys: e.licenseKeys,
      numberOfLicenses: e.numberOfLicenses ?? undefined,
      requisitionNumber: e.requisitionNumber ?? undefined,
      attachment: e.attachment ?? undefined,
      description: e.description ?? undefined,
      subscriptionDate: e.subscriptionDate ?? undefined,
      expirationDate: e.expirationDate ?? undefined,
      purchaseDate: e.purchaseDate ?? undefined,
      type: e.itemType,
      archived: e.archived,
    }))

    const activeItems = temp.filter((item) => !item.archived)
    const archivedItems = temp.filter((item) => item.archived)

    setData(activeItems)
    setArchivedData(archivedItems)
    setDisplayData(showArchived ? archivedItems : activeItems)
  }

  const sortData = (data: DisplayedItems[], order: "recent" | "oldest") => {
    const sortedData = [...data].sort((a, b) => {
      if (!a.expirationDate || !b.expirationDate) return 0
      return order === "recent"
        ? b.expirationDate.getTime() - a.expirationDate.getTime()
        : a.expirationDate.getTime() - b.expirationDate.getTime()
    })
    setDisplayData(sortedData)
  }

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows(displayData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  }

  const handleRowSelect = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows((prev) => [...prev, id])
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id))
    }
  }

  const exportHardwareReport = () => {
    const hardwareReport = data
      .filter((item) => {
        if (!item.purchaseDate || item.type !== "HARDWARE") return false
        const fiveYearsAgo = new Date()
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
        return item.purchaseDate < fiveYearsAgo
      })
      .map((item) => ({
        name: item.name,
        owner: item.owner,
        ownerEmail: item.ownerEmail,
        purchaseDate: item.purchaseDate?.toLocaleDateString(),
        expirationDate: item.expirationDate?.toLocaleDateString(),
        requisitionNumber: item.requisitionNumber,
        attachment: item.attachment,
        description: item.description,
        type: item.type,
        archived: item.archived ? "Yes" : "No", // <-- Add archive column
      }))

    if (hardwareReport.length === 0) {
      alert("No hardware products found for the report.")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(hardwareReport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hardware Report")
    XLSX.writeFile(workbook, "Hardware_Report.xlsx")
  }

  const exportSoftwareReport = () => {
    const softwareReport = data
      .filter((item) => {
        if (!item.expirationDate || item.type !== "SOFTWARE") return false
        return item.expirationDate < new Date()
      })
      .map((item) => ({
        name: item.name,
        owner: item.owner,
        ownerEmail: item.ownerEmail,
        subscriptionDate: item.subscriptionDate?.toLocaleDateString(),
        expirationDate: item.expirationDate?.toLocaleDateString(),
        requisitionNumber: item.requisitionNumber,
        attachment: item.attachment,
        description: item.description,
        type: item.type,
        archived: item.archived ? "Yes" : "No", // <-- Add archive column
      }))

    if (softwareReport.length === 0) {
      alert("No software products found for the report.")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(softwareReport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Software Report")
    XLSX.writeFile(workbook, "Software_Report.xlsx")
  }

  const toggleField = (field: string) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const handleRenewClick = (item: DisplayedItems) => {
    setSelectedItem(item)
    const currentSubscriptionDate = item.type === "SOFTWARE" ? new Date() : null
    setNewSubscriptionDate(currentSubscriptionDate)
    const currentPurchaseDate = item.type === "HARDWARE" ? new Date() : null
    setNewPurchaseDate(currentPurchaseDate)
    if (item.type === "HARDWARE" && currentPurchaseDate) {
      const newExpirationDate = new Date(currentPurchaseDate)
      newExpirationDate.setFullYear(currentPurchaseDate.getFullYear() + 5)
      setNewExpirationDate(newExpirationDate)
    } else if (item.subscriptionDate && item.expirationDate) {
      const oldSubscriptionDate = new Date(item.subscriptionDate)
      const oldExpirationDate = new Date(item.expirationDate)
      const yearDifference = oldExpirationDate.getFullYear() - oldSubscriptionDate.getFullYear()
      if (currentSubscriptionDate) {
        const newExpirationDate = new Date(currentSubscriptionDate)
        newExpirationDate.setFullYear(currentSubscriptionDate.getFullYear() + yearDifference)
        if (currentSubscriptionDate.getDate() !== newExpirationDate.getDate()) {
          newExpirationDate.setDate(currentSubscriptionDate.getDate())
        }
        setNewExpirationDate(newExpirationDate)
      } else {
        setNewExpirationDate(item.expirationDate ?? null)
      }
    } else {
      setNewExpirationDate(item.expirationDate ?? null)
    }
    setIsRenewModalOpen(true)
  }

  const handleConfirmRenew = async () => {
    if (!selectedItem) return
    const updatedData = {
      subscriptionDate: newSubscriptionDate || undefined,
      purchaseDate: newPurchaseDate || undefined,
      expirationDate: newExpirationDate || undefined,
    }
    await renewItem(selectedItem.id, updatedData)
    setIsRenewModalOpen(false)
    updateData()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setDisplayData(showArchived ? archivedData : data)
      return
    }

    const lowercaseQuery = query.toLowerCase()
    const filtered = (showArchived ? archivedData : data).filter(
      (item) =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.owner.toLowerCase().includes(lowercaseQuery) ||
        (item.ownerEmail && item.ownerEmail.toLowerCase().includes(lowercaseQuery)),
    )

    setDisplayData(filtered)
    setCurrentPage(1)
  }

  // Scroll to bottom handler
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const handleScrollToBottom = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: tableContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  // Scroll to right handler
  const handleScrollToRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        left: tableContainerRef.current.scrollWidth,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    updateData()
  }, [])

  useEffect(() => {
    updateData()
  }, [showArchived])

  useEffect(() => {
    sortData(data, sortOrder)
  }, [sortOrder])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportOptionsRef.current && !exportOptionsRef.current.contains(event.target as Node)) {
        setShowExportOptions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const savedFields = localStorage.getItem("tableSettings")
    if (savedFields) {
      setSelectedFields(JSON.parse(savedFields))
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [displayData])

  const handleApplySettings = () => {
    localStorage.setItem("tableSettings", JSON.stringify(selectedFields))
    setIsCustomizationOpen(false)
  }

  const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(displayData.length / itemsPerPage)

  const exportAllData = () => {
    // Combine both active and archived items for a full export
    const allItems = [...data, ...archivedData];

    // Separate hardware and software items
    const hardwareRows = allItems
      .filter((item) => item.type === "HARDWARE")
      .map((item) => ({
        "Product Name": item.name,
        "Owner": item.owner,
        "Owner Email": item.ownerEmail || "",
        "License Key": item.licenseKeys?.map((key: any) => key.key).join(", ") || "",
        "Number of Licenses": item.numberOfLicenses ?? "",
        "Requisition Number": item.requisitionNumber ?? "",
        "Attachment": item.attachment ?? "",
        "Description": item.description ?? "",
        "Purchase Date": item.purchaseDate ? item.purchaseDate.toLocaleDateString() : "",
        "Expiration": item.expirationDate
          ? item.expirationDate.toLocaleDateString()
          : "",
        "Type": item.type,
        "Archived": item.archived ? "Yes" : "No",
      }));

    const softwareRows = allItems
      .filter((item) => item.type === "SOFTWARE")
      .map((item) => ({
        "Product Name": item.name,
        "Owner": item.owner,
        "Owner Email": item.ownerEmail || "",
        "License Key": item.licenseKeys?.map((key: any) => key.key).join(", ") || "",
        "Number of Licenses": item.numberOfLicenses ?? "",
        "Requisition Number": item.requisitionNumber ?? "",
        "Attachment": item.attachment ?? "",
        "Description": item.description ?? "",
        "Subscription Date": item.subscriptionDate ? item.subscriptionDate.toLocaleDateString() : "",
        "Expiration": item.expirationDate
          ? item.expirationDate.toLocaleDateString()
          : "Lifetime",
        "Type": item.type,
        "Archived": item.archived ? "Yes" : "No",
      }));

    if (hardwareRows.length === 0 && softwareRows.length === 0) {
      alert("No items found to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    if (hardwareRows.length > 0) {
      const hardwareSheet = XLSX.utils.json_to_sheet(hardwareRows);
      XLSX.utils.book_append_sheet(workbook, hardwareSheet, "Hardware");
    }

    if (softwareRows.length > 0) {
      const softwareSheet = XLSX.utils.json_to_sheet(softwareRows);
      XLSX.utils.book_append_sheet(workbook, softwareSheet, "Software");
    }

    XLSX.writeFile(workbook, "All_Inventory.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Table Settings Dialog */}
        <Dialog
          open={isCustomizationOpen}
          onClose={() => setIsCustomizationOpen(false)}
          className="fixed z-10 inset-0 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative z-10">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">Customize Table</Dialog.Title>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => (
                  <label key={field.key} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => toggleField(field.key)}
                      className="rounded text-gray-900 focus:ring-gray-500"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={() => setIsCustomizationOpen(false)} variant="outline" className="text-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleApplySettings} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </Dialog>

        {/* Renew Modal */}
        <RenewModal
          open={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          selectedItem={selectedItem}
          newSubscriptionDate={newSubscriptionDate}
          setNewSubscriptionDate={setNewSubscriptionDate}
          newPurchaseDate={newPurchaseDate}
          setNewPurchaseDate={setNewPurchaseDate}
          newExpirationDate={newExpirationDate}
          setNewExpirationDate={setNewExpirationDate}
          onConfirm={handleConfirmRenew}
        />

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-[400px] max-w-lg"> {/* changed from sm:w-auto max-w-md to sm:w-[400px] max-w-lg */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, owner or email..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
            <div className="relative" ref={exportOptionsRef}>
              <Button
                onClick={() => setShowExportOptions(!showExportOptions)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>

              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border overflow-hidden">
                  <button
                    onClick={() => {
                      exportHardwareReport()
                      setShowExportOptions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Hardware Report
                  </button>
                  <button
                    onClick={() => {
                      exportSoftwareReport()
                      setShowExportOptions(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Software Report
                  </button>
                  <button
                    onClick={() => {
                      exportAllData();
                      setShowExportOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Export All Data
                  </button>
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowArchived(!showArchived)}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              <span>{showArchived ? "Show Active" : "Show Archived"}</span>
            </Button>

            {showArchived ? (
              <Button
                onClick={async () => {
                  if (selectedRows.length > 0) {
                    await unarchiveItem(selectedRows)
                    setSelectedRows([])
                    updateData()
                  }
                }}
                variant="outline"
                className="flex items-center gap-2"
                disabled={selectedRows.length === 0}
              >
                <ArchiveRestore className="h-4 w-4" />
                <span>Unarchive Selected</span>
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  if (selectedRows.length > 0) {
                    await archiveItem(selectedRows)
                    setSelectedRows([])
                    updateData()
                  }
                }}
                variant="outline"
                className="flex items-center gap-2"
                disabled={selectedRows.length === 0}
              >
                <Archive className="h-4 w-4" />
                <span>Archive Selected</span>
              </Button>
            )}

            <Button onClick={() => setIsCustomizationOpen(true)} variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Customize</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border relative">
          {/* Scroll to bottom button */}
          <button
            onClick={handleScrollToBottom}
            className="absolute right-4 top-4 z-20 bg-gray-900 text-white rounded-full p-2 shadow hover:bg-gray-700 transition"
            title="Scroll to bottom"
            style={{ display: paginatedData.length > 10 ? "block" : "none" }}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          {/* Scroll to right button - middle right edge */}
          <button
            onClick={handleScrollToRight}
            className="absolute top-1/2 right-0 -translate-y-1/2 z-20 bg-gray-900 text-white rounded-full p-2 shadow hover:bg-gray-700 transition"
            title="Scroll to right"
            style={{ display: "block" }}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <div
            className="overflow-x-auto max-h-[80vh] scroll-smooth"
            ref={tableContainerRef}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left bg-gray-50">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={
                          paginatedData.length > 0 &&
                          paginatedData.every((item) => selectedRows.includes(item.id))
                        }
                      />
                      <label htmlFor="checkbox-all" className="sr-only">
                        Select all
                      </label>
                    </div>
                  </th>
                  {fields
                    .filter((field) => selectedFields.includes(field.key))
                    .map((field) => (
                      <th
                        key={field.key}
                        scope="col"
                        className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                      >
                        {field.label}
                      </th>
                    ))}
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-${item.id}`}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                            onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                            checked={selectedRows.includes(item.id)}
                          />
                          <label htmlFor={`checkbox-${item.id}`} className="sr-only">
                            Select item
                          </label>
                        </div>
                      </td>

                      {selectedFields.includes("name") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{truncate(item.name, 30)}</div>
                        </td>
                      )}

                      {selectedFields.includes("owner") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{item.owner}</div>
                        </td>
                      )}

                      {selectedFields.includes("ownerEmail") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{item.ownerEmail || "—"}</div>
                        </td>
                      )}

                      {selectedFields.includes("licenseKey") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          {item.licenseKeys && item.licenseKeys.length > 0 ? (
                            <LicenseKeysModal licenseKeys={item.licenseKeys} productName={item.name} />
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                      )}

                      {selectedFields.includes("numLicenses") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{item.numberOfLicenses || "—"}</div>
                        </td>
                      )}

                      {selectedFields.includes("requisitionNumber") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{item.requisitionNumber || "—"}</div>
                        </td>
                      )}

                      {selectedFields.includes("attachment") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          {item.attachment ? (
                            <a
                              href={item.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                      )}

                      {selectedFields.includes("description") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {item.description ? truncate(item.description, 50) : "—"}
                          </div>
                        </td>
                      )}

                      {selectedFields.includes("purchaseDate") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{item.purchaseDate?.toLocaleDateString() || "—"}</div>
                        </td>
                      )}

                      {selectedFields.includes("subscriptionDate") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {item.subscriptionDate?.toLocaleDateString() || "—"}
                          </div>
                        </td>
                      )}

                      {selectedFields.includes("expirationDate") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className={`text-sm ${textDateColor(item.expirationDate)}`}>
                            {item.expirationDate?.toLocaleDateString() || "Lifetime"}
                          </div>
                        </td>
                      )}

                      {selectedFields.includes("type") && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.type === "SOFTWARE" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                      )}

                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => handleRenewClick(item)}
                            variant="outline"
                            size="sm"
                            className="text-gray-700 border-gray-300 hover:bg-gray-50"
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Renew
                          </Button>

                          <div className="flex space-x-1">
                            <EditItemModal id={item.id} updateData={updateData} />
                            <DetailsModal id={item.id} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={selectedFields.length + 2} className="px-6 py-10 text-center text-sm text-gray-500">
                      {searchQuery
                        ? "No items match your search criteria"
                        : showArchived
                          ? "No archived items found"
                          : "No items found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {displayData.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, displayData.length)}</span> of{" "}
                    <span className="font-medium">{displayData.length}</span> results
                  </p>
                </div>

                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? "z-10 bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    <Button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
