"use client";

import CreateItemModal from "@/components/add-modal";
import EditItemModal from "@/components/edit-modal";
import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getItems, updateItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { truncate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { DisplayedItems } from "@/lib/types";
import { archiveItem, unarchiveItem } from "@/actions/items";
import * as XLSX from "xlsx";
import DetailsModal from "@/components/details-modal";
import { Dialog } from "@headlessui/react";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const page = Number.parseInt(searchParams.get("page") ?? "1") - 1;
  const now = new Date();
  const [data, setData] = useState<DisplayedItems[]>([]);
  const [displayData, setDisplayData] = useState<DisplayedItems[]>([]);
  const [archivedData, setArchivedData] = useState<DisplayedItems[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const exportOptionsRef = useRef<HTMLDivElement>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "name",
    "owner",
    "purchaseDate",
    "subscriptionDate",
    "expirationDate",
    "type",
  ]);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DisplayedItems | null>(null);
  const [newSubscriptionDate, setNewSubscriptionDate] = useState<Date | null>(
    null
  );
  const [newPurchaseDate, setNewPurchaseDate] = useState<Date | null>(null);
  const [newExpirationDate, setNewExpirationDate] = useState<Date | null>(null);

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
  ];

  const textDateColor = (date: Date | null | undefined) => {
    if (!date) return "inherit";
    if (date < now) return "red";
    if (date < new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)) {
      return "orange";
    }
    return "inherit";
  };

  const updateData = async () => {
    const res = await getItems(page * 10, 10);
    const temp = res.map((e) => ({
      id: e.id,
      name: e.name,
      owner: e.owner,
      ownerEmail: e.ownerEmail ?? undefined,
      licenseKey: e.licenseKey ?? undefined,
      numberOfLicenses: e.numberOfLicenses ?? undefined,
      requisitionNumber: e.requisitionNumber ?? undefined,
      attachment: e.attachment ?? undefined,
      description: e.description ?? undefined,
      subscriptionDate: e.subscriptionDate ?? undefined,
      expirationDate: e.expirationDate ?? undefined,
      purchaseDate: e.purchaseDate ?? undefined,
      type: e.itemType,
      archived: e.archived,
    }));

    const activeItems = temp.filter((item) => !item.archived);
    const archivedItems = temp.filter((item) => item.archived);

    setData(activeItems);
    setArchivedData(archivedItems);
    setDisplayData(showArchived ? archivedItems : activeItems);
  };

  const sortData = (data: DisplayedItems[], order: "recent" | "oldest") => {
    const sortedData = [...data].sort((a, b) => {
      if (!a.expirationDate || !b.expirationDate) return 0;
      return order === "recent"
        ? b.expirationDate.getTime() - a.expirationDate.getTime()
        : a.expirationDate.getTime() - b.expirationDate.getTime();
    });
    setDisplayData(sortedData);
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows(displayData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const exportHardwareReport = () => {
    const hardwareReport = data
      .filter((item) => {
        if (!item.purchaseDate || item.type !== "HARDWARE") return false;
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        return item.purchaseDate < fiveYearsAgo;
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
      }));

    if (hardwareReport.length === 0) {
      alert("No hardware products found for the report.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(hardwareReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hardware Report");
    XLSX.writeFile(workbook, "Hardware_Report.xlsx");
  };

  const exportSoftwareReport = () => {
    const softwareReport = data
      .filter((item) => {
        if (!item.expirationDate || item.type !== "SOFTWARE") return false;
        return item.expirationDate < new Date();
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
      }));

    if (softwareReport.length === 0) {
      alert("No software products found for the report.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(softwareReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Software Report");
    XLSX.writeFile(workbook, "Software_Report.xlsx");
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleRenewClick = (item: DisplayedItems) => {
    setSelectedItem(item);
    const currentSubscriptionDate = item.type === "SOFTWARE" ? new Date() : null;
    setNewSubscriptionDate(currentSubscriptionDate);
    const currentPurchaseDate = item.type === "HARDWARE" ? new Date() : null;
    setNewPurchaseDate(currentPurchaseDate);
    if (item.type === "HARDWARE" && currentPurchaseDate) {
      const newExpirationDate = new Date(currentPurchaseDate);
      newExpirationDate.setFullYear(currentPurchaseDate.getFullYear() + 5);
      setNewExpirationDate(newExpirationDate);
    } else if (item.subscriptionDate && item.expirationDate) {
      const oldSubscriptionDate = new Date(item.subscriptionDate);
      const oldExpirationDate = new Date(item.expirationDate);
      const yearDifference =
        oldExpirationDate.getFullYear() - oldSubscriptionDate.getFullYear();
      if (currentSubscriptionDate) {
        const newExpirationDate = new Date(currentSubscriptionDate);
        newExpirationDate.setFullYear(
          currentSubscriptionDate.getFullYear() + yearDifference
        );
        if (currentSubscriptionDate.getDate() !== newExpirationDate.getDate()) {
          newExpirationDate.setDate(currentSubscriptionDate.getDate());
        }
        setNewExpirationDate(newExpirationDate);
      } else {
        setNewExpirationDate(item.expirationDate ?? null);
      }
    } else {
      setNewExpirationDate(item.expirationDate ?? null);
    }
    setIsRenewModalOpen(true);
  };

  const handleConfirmRenew = async () => {
    if (!selectedItem) return;
    const updatedData = {
      subscriptionDate: newSubscriptionDate || undefined,
      purchaseDate: newPurchaseDate || undefined,
      expirationDate: newExpirationDate || undefined,
    };
    await updateItem(selectedItem.id, updatedData);
    setIsRenewModalOpen(false);
    updateData();
  };

  useEffect(() => {
    updateData();
  }, []);

  useEffect(() => {
    updateData();
  }, [showArchived]);

  useEffect(() => {
    sortData(data, sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportOptionsRef.current &&
        !exportOptionsRef.current.contains(event.target as Node)
      ) {
        setShowExportOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-dvh bg-muted pt-4">
      <Dialog
        open={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto backdrop-blur-sm bg-black/30"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">Table Settings</h2>
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <label key={field.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                  />
                  {field.label}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={() => setIsCustomizationOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white rounded p-2"
              >
                Close
              </Button>
              <Button
                onClick={() => setIsCustomizationOpen(false)}
                className="bg-black hover:bg-gray-800 text-white rounded p-2"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen backdrop-blur-sm bg-black/30">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-bold mb-4">Renew Item</h2>
            {selectedItem && (
              <div className="flex flex-col gap-4">
                {selectedItem.type === "SOFTWARE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Subscription Date
                    </label>
                    <input
                      type="date"
                      value={
                        newSubscriptionDate?.toISOString().split("T")[0] || ""
                      }
                      onChange={(e) =>
                        setNewSubscriptionDate(
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                )}
                {selectedItem?.type === "HARDWARE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Purchase Date
                    </label>
                    <input
                      type="date"
                      value={newPurchaseDate?.toISOString().split("T")[0] || ""}
                      onChange={(e) =>
                        setNewPurchaseDate(
                          e.target.value ? new Date(e.target.value) : null
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Expiration Date
                  </label>
                  <input
                    type="date"
                    value={newExpirationDate?.toISOString().split("T")[0] || ""}
                    onChange={(e) =>
                      setNewExpirationDate(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setIsRenewModalOpen(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white rounded p-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmRenew}
                    className="bg-black hover:bg-gray-800 text-white rounded p-2"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
      <div className="w-full flex justify-center">
        <div className="flex justify-between mb-2 w-[90%]">
          <Input
            placeholder="Search Product"
            className="w-[20%] h-10 bg-background"
            onChange={(e) => {
              const searchValue = e.target.value.toLowerCase();
              setDisplayData(
                (showArchived ? archivedData : data).filter((item) =>
                  item.name.toLowerCase().includes(searchValue)
                )
              );
            }}
          />
          <div className="flex gap-2">
            <div className="relative" ref={exportOptionsRef}>
              <Button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="bg-black hover:bg-gray-800 text-white rounded p-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm5.845 17.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V12a.75.75 0 0 0-1.5 0v4.19l-1.72-1.72a.75.75 0 1 0-1.06 1.06l3 3Z"
                    clipRule="evenodd"
                  />
                  <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
                </svg>
                Export Report
              </Button>
              {showExportOptions && (
                <div className="absolute top-full mt-2 bg-white shadow-lg rounded p-2 flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      exportHardwareReport();
                      setShowExportOptions(false);
                    }}
                    className="bg-black hover:bg-gray-800 text-white rounded p-2"
                  >
                    Hardware
                  </Button>
                  <Button
                    onClick={() => {
                      exportSoftwareReport();
                      setShowExportOptions(false);
                    }}
                    className="bg-black hover:bg-gray-800 text-white rounded p-2"
                  >
                    Software
                  </Button>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowArchived(!showArchived)}
              className="bg-black hover:bg-gray-800 text-white rounded p-2"
            >
              {showArchived ? "Show Active" : "Show Archived"}
            </Button>
            {showArchived ? (
              <Button
                onClick={async () => {
                  if (selectedRows.length > 0) {
                    await unarchiveItem(selectedRows);
                    setSelectedRows([]);
                    updateData();
                  }
                }}
                className="bg-black hover:bg-gray-800 text-white rounded p-2"
                disabled={selectedRows.length === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                  <path
                    fillRule="evenodd"
                    d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.133 2.845a.75.75 0 0 1 1.06 0l1.72 1.72 1.72-1.72a.75.75 0 1 1 1.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 1 1-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 1 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
                Unarchive
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  if (selectedRows.length > 0) {
                    await archiveItem(selectedRows);
                    setSelectedRows([]);
                    updateData();
                  }
                }}
                className="bg-black hover:bg-gray-800 text-white rounded p-2"
                disabled={selectedRows.length === 0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                  <path
                    fillRule="evenodd"
                    d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087ZM12 10.5a.75.75 0 0 1 .75.75v4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72-1.72v-4.94a.75.75 0 0 1 .75-.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                Archive
              </Button>
            )}
            <CreateItemModal updateData={updateData} />
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="overflow-x-auto shadow-md sm:rounded-lg w-[90%]">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="p-4">
                      <div className="flex items-center">
                        <input
                          id="checkbox-all"
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          checked={
                            selectedRows.length === displayData.length &&
                            displayData.length > 0
                          }
                        />
                        <label htmlFor="checkbox-all" className="sr-only">
                          checkbox
                        </label>
                      </div>
                    </th>
                    {fields
                      .filter((field) => selectedFields.includes(field.key))
                      .map((field) => (
                        <th
                          key={field.key}
                          scope="col"
                          className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                        >
                          {field.label}
                        </th>
                      ))}
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                    >
                      Renew
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 relative"
                    >
                      Action
                      <button
                        onClick={() => setIsCustomizationOpen(true)}
                        className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2 bg-transparent"
                        aria-label="Customize"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="size-4 text-black"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.455 1.45A.5.5 0 0 1 6.952 1h2.096a.5.5 0 0 1 .497.45l.186 1.858a4.996 4.996 0 0 1 1.466.848l1.703-.769a.5.5 0 0 1 .639.206l1.047 1.814a.5.5 0 0 1-.14.656l-1.517 1.09a5.026 5.026 0 0 1 0 1.694l1.516 1.09a.5.5 0 0 1 .141.656l-1.047 1.814a.5.5 0 0 1-.639.206l-1.703-.768c-.433.36-.928.649-1.466.847l-.186 1.858a.5.5 0 0 1-.497.45H6.952a.5.5 0 0 1-.497-.45l-.186-1.858a4.993 4.993 0 0 1-1.466-.848l-1.703.769a.5.5 0 0 1-.639-.206l-1.047-1.814a.5.5 0 0 1 .14-.656l1.517-1.09a5.033 5.033 0 0 1 0-1.694l-1.516-1.09a.5.5 0 0 1-.141-.656L2.46 3.593a.5.5 0 0 1 .639-.206l1.703.769c.433-.36.928-.65 1.466-.848l.186-1.858Zm-.177 7.567-.022-.037a2 2 0 0 1 3.466-1.997l.022.037a2 2 0 0 1-3.466 1.997Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {displayData.length > 0 ? (
                    displayData.map((e, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="p-4 w-4">
                          <div className="flex items-center">
                            <input
                              id={`checkbox-table-${e.id}`}
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              onChange={(event) =>
                                handleRowSelect(e.id, event.target.checked)
                              }
                              checked={selectedRows.includes(e.id)}
                            />
                            <label
                              htmlFor={`checkbox-table-${e.id}`}
                              className="sr-only"
                            >
                              checkbox
                            </label>
                          </div>
                        </td>
                        {selectedFields.includes("name") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {truncate(e.name, 20)}
                          </td>
                        )}
                        {selectedFields.includes("owner") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white">
                            {e.owner}
                          </td>
                        )}
                        {selectedFields.includes("ownerEmail") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {e.ownerEmail ?? "N/A"}
                          </td>
                        )}
                        {selectedFields.includes("licenseKey") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {e.licenseKey ?? "N/A"}
                          </td>
                        )}
                        {selectedFields.includes("numLicenses") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {e.numberOfLicenses ?? "N/A"}
                          </td>
                        )}
                        {selectedFields.includes("requisitionNumber") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {e.requisitionNumber ?? "N/A"}
                          </td>
                        )}
                        {selectedFields.includes("attachment") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {e.attachment ? (
                              <a
                                href={e.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </td>
                        )}
                        {selectedFields.includes("description") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {truncate(e.description, 50) ?? "N/A"}
                          </td>
                        )}
                        {selectedFields.includes("purchaseDate") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white hidden md:table-cell">
                            {e.purchaseDate?.toLocaleDateString() ?? "N/A"}
                          </td>
                        )}
                        {selectedFields.includes("subscriptionDate") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white hidden md:table-cell">
                            {e.subscriptionDate?.toLocaleDateString() ?? "N/A"}
                          </td>
                        )}
                        {selectedFields.includes("expirationDate") && (
                          <td
                            className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                            style={{
                              color: textDateColor(e.expirationDate),
                            }}
                          >
                            {e.expirationDate?.toLocaleDateString()}
                          </td>
                        )}
                        {selectedFields.includes("type") && (
                          <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white hidden sm:table-cell">
                            {e.type}
                          </td>
                        )}
                        <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                          <Button
                            onClick={() => handleRenewClick(e)}
                            className="bg-red-950 hover:bg-red-600 text-white rounded p-2"
                          >
                            Renew
                          </Button>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                          <div className="flex gap-2">
                            <EditItemModal id={e.id} updateData={updateData} />
                            <DetailsModal id={e.id} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-2 text-center">
                        No data to show
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}