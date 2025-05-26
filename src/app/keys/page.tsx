"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Copy, Download, Key, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import AddKeysModal from "@/components/add-keys-modal";
import { formatDistanceToNow } from "date-fns";
import DetailsModal from "@/components/item-details-modal";
import EditLicenseStatusModal from "@/components/edit-license-status-modal";
import * as XLSX from "xlsx";

function LicenseKeysTable({
  query,
  status,
  page,
}: {
  query?: string;
  status?: string;
  page?: string;
}) {
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [allLicenseKeys, setAllLicenseKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLicenseKey, setSelectedLicenseKey] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState(query || "");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    fetch(`/api/keys?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setAllLicenseKeys(data.licenseKeys);
        setLoading(false);
      });
  }, [status]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLicenseKeys(allLicenseKeys);
      setTotalCount(allLicenseKeys.length);
      setTotalPages(Math.ceil(allLicenseKeys.length / itemsPerPage));
      return;
    }
    const lower = searchQuery.toLowerCase();
    const filtered = allLicenseKeys.filter(
      (key: any) =>
        key.key.toLowerCase().includes(lower) ||
        (key.item?.name && key.item.name.toLowerCase().includes(lower))
    );
    setLicenseKeys(filtered);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchQuery, allLicenseKeys]);

  const paginatedKeys = licenseKeys.slice(
    ((Number(page) || 1) - 1) * itemsPerPage,
    (Number(page) || 1) * itemsPerPage
  );

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (status) params.append("status", status);
    if (page) params.append("page", page);
    fetch(`/api/keys?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLicenseKeys(data.licenseKeys);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        setLoading(false);
      });
  }, [query, status, page]);

  async function handleSaveStatus(newStatus: string) {
    await fetch(`/api/license-keys`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedLicenseKey.id, status: newStatus }),
    });
    setSelectedLicenseKey(null);
    setEditModalOpen(false);

    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (status) params.append("status", status);
    if (page) params.append("page", page);
    fetch(`/api/keys?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLicenseKeys(data.licenseKeys);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
        setLoading(false);
      });
  }

  const handleExport = async () => {

    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (status) params.append("status", status);

    const res = await fetch(`/api/keys?${params.toString()}`);
    const data = await res.json();
    const allKeys = data.licenseKeys;

    const rows = allKeys.map((key: any) => ({
      "License Key": key.key,
      "Product Name": key.item?.name || "",
      Status: key.status,
      "Created At": key.createdAt
        ? new Date(key.createdAt).toLocaleString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "License Keys");

    XLSX.writeFile(workbook, "license-keys.xlsx");
  };

  function renderRows() {
    if (loading) {

      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          <TableCell colSpan={5}>
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </TableRow>
      ));
    }
    if (licenseKeys.length === 0) {
      return [
        <TableRow key="empty">
          <TableCell colSpan={5}>No data</TableCell>
        </TableRow>,
      ];
    }
    return licenseKeys.map((licenseKey) => (
      <TableRow key={licenseKey.id} className="group">
        <TableCell className="font-mono">
          <div className="flex items-center">
            <span className="mr-2 text-primary">
              <Key className="h-4 w-4" />
            </span>
            {licenseKey.key}
          </div>
        </TableCell>
        <TableCell>
          {licenseKey.item ? (
            <DetailsModal id={licenseKey.item.id}>
              <button className="text-primary hover:underline font-medium">
                {licenseKey.item.name}
              </button>
            </DetailsModal>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant={licenseKey.status === "active" ? "default" : "destructive"}
            className={
              licenseKey.status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {licenseKey.status.charAt(0).toUpperCase() +
              licenseKey.status.slice(1)}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {licenseKey.createdAt
            ? formatDistanceToNow(new Date(licenseKey.createdAt), {
                addSuffix: true,
              })
            : "N/A"}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                navigator.clipboard.writeText(licenseKey.key);
              }}
              title="Copy Key"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy license key</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                setSelectedLicenseKey(licenseKey);
                setEditModalOpen(true);
              }}
              title="Edit Status"
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
              <span className="sr-only">Edit license status</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {licenseKeys.length} of {allLicenseKeys.length} license keys
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="mb-4 w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search license keys or product name..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">License Key</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No data</TableCell>
              </TableRow>
            ) : (
              paginatedKeys.map((licenseKey) => (
                <TableRow key={licenseKey.id} className="group">
                  <TableCell className="font-mono">
                    <div className="flex items-center">
                      <span className="mr-2 text-primary">
                        <Key className="h-4 w-4" />
                      </span>
                      {licenseKey.key}
                    </div>
                  </TableCell>
                  <TableCell>
                    {licenseKey.item ? (
                      <DetailsModal id={licenseKey.item.id}>
                        <button className="text-primary hover:underline font-medium">
                          {licenseKey.item.name}
                        </button>
                      </DetailsModal>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        licenseKey.status === "active"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        licenseKey.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {licenseKey.status.charAt(0).toUpperCase() +
                        licenseKey.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {licenseKey.createdAt
                      ? formatDistanceToNow(new Date(licenseKey.createdAt), {
                          addSuffix: true,
                        })
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(licenseKey.key);
                        }}
                        title="Copy Key"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy license key</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedLicenseKey(licenseKey);
                          setEditModalOpen(true);
                        }}
                        title="Edit Status"
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
                        <span className="sr-only">Edit license status</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <EditLicenseStatusModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        licenseKey={selectedLicenseKey}
        onSave={handleSaveStatus}
      />
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={Number(page) === 1}
            asChild
          >
            <Link
              href={{
                pathname: "/keys",
                query: {
                  ...(query ? { query } : {}),
                  ...(status ? { status } : {}),
                  page: Number(page) - 1,
                },
              }}
            >
              Previous
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={Number(page) === totalPages}
            asChild
          >
            <Link
              href={{
                pathname: "/keys",
                query: {
                  ...(query ? { query } : {}),
                  ...(status ? { status } : {}),
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
  );
}

export default function LicenseKeyDatabasePage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("query") || "";
  const status = searchParams?.get("status") || "all";
  const currentPage = searchParams?.get("page") || "1";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              License Key Database
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your product license keys
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>License Keys</CardTitle>
              <CardDescription>
                View and manage all your product license keys
              </CardDescription>
            </div>
            <div className="flex items-center gap-2"></div>
          </CardHeader>
          <CardContent>
            <LicenseKeysTable
              query={query}
              status={status}
              page={currentPage}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
