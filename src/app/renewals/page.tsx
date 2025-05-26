import {
  getRecentlyRenewedItems,
  getTotalRenewalsCount,
  getLastMonthRenewalsCount,
  getExpiringItemsCount,
  getExpiredItemsCount,
} from "@/actions/items";
import DetailsModal from "@/components/item-details-modal";
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
import { Suspense } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  Package,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ExpiredProductsModal from "@/components/expired-modal";

interface RenewalHistoryPageProps {
  searchParams?: {
    query?: string;
    page?: string;
  };
}

function RenewalHistoryTable({
  query,
  page,
}: {
  query?: string;
  page?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      }
    >
      <RenewalHistoryContent query={query} page={page} />
    </Suspense>
  );
}

async function RenewalHistoryContent({
  query,
  page,
}: {
  query?: string;
  page?: string;
}) {
  const currentPage = page ? Number.parseInt(page) : 1;
  const renewals = await getRecentlyRenewedItems({ all: true });

  const filteredRenewals = query
    ? renewals.filter(
        (renewal) =>
          renewal.item?.name?.toLowerCase().includes(query.toLowerCase()) ||
          renewal.item?.owner?.toLowerCase().includes(query.toLowerCase())
      )
    : renewals;

  const now = new Date();

  function getExpirationStatus(dateStr: string | null | undefined) {
    if (!dateStr) return null;

    const expirationDate = new Date(dateStr);
    const diffInDays = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (diffInDays < 0) {
      return {
        status: "expired",
        label: "Expired",
        variant: "destructive" as const,
      };
    } else if (diffInDays <= 30) {
      return {
        status: "expiring",
        label: "Expiring Soon",
        variant: "warning" as const,
      };
    } else {
      return { status: "active", label: "Active", variant: "default" as const };
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredRenewals.length}{" "}
            {filteredRenewals.length === 1 ? "renewal" : "renewals"}
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Product Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead className="text-center">Licenses</TableHead>
              <TableHead>New Dates</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRenewals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2 opacity-50" />
                    <p>No renewal history found</p>
                    {query && (
                      <p className="text-sm mt-1">
                        Try adjusting your search query
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRenewals.map((renewal) => {
                const expirationStatus = getExpirationStatus(
                  renewal.item?.expirationDate
                    ? typeof renewal.item.expirationDate === "string"
                      ? renewal.item.expirationDate
                      : renewal.item.expirationDate instanceof Date
                      ? renewal.item.expirationDate.toISOString()
                      : undefined
                    : undefined
                );

                return (
                  <TableRow key={renewal.id}>
                    <TableCell className="font-medium">
                      {renewal.item?.id ? (
                        <DetailsModal id={renewal.item.id}>
                          <button className="text-primary hover:text-primary/80 font-medium flex items-center">
                            {renewal.item?.name ?? "N/A"}
                          </button>
                        </DetailsModal>
                      ) : (
                        <span className="flex items-center">
                          <Package className="h-4 w-4 mr-1.5 text-muted-foreground" />
                          {renewal.item?.name ?? "N/A"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <span>{renewal.item?.owner ?? "N/A"}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        <span>
                          {renewal.renewedAt
                            ? new Date(renewal.renewedAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-primary/5">
                        {renewal.item?.numberOfLicenses ?? "N/A"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {renewal.item?.subscriptionDate && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Subscription: </span>
                            <span className="ml-1 font-medium text-foreground">
                              {new Date(
                                renewal.item.subscriptionDate
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        {renewal.item?.expirationDate && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Expires: </span>
                            <span className="ml-1 font-medium text-foreground">
                              {new Date(
                                renewal.item.expirationDate
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default async function RenewalHistoryPage({
  searchParams,
}: RenewalHistoryPageProps) {
  const query = searchParams?.query || "";
  const currentPage = searchParams?.page || "1";

  const [totalRenewals, lastMonthRenewals, expiringCount, expiredCount] =
    await Promise.all([
      getTotalRenewalsCount(),
      getLastMonthRenewalsCount(),
      getExpiringItemsCount(),
      getExpiredItemsCount(),
    ]);

  const percentChange =
    lastMonthRenewals === 0
      ? 0
      : Math.round(
          (lastMonthRenewals / (totalRenewals - lastMonthRenewals)) * 100
        );

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
              Renewal Database
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your product renewals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Renewals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRenewals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {lastMonthRenewals} renewed this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Renewals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expired Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {expiredCount}
              </div>
              <ExpiredProductsModal />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Renewals</CardTitle>
            <CardDescription>
              A list of all product renewals and their updated information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RenewalHistoryTable query={query} page={currentPage} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
