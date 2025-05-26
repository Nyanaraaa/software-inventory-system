import { Clock, FileText, Package } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { SideNav } from "@/components/sidenav"
import { RecentSales } from "@/components/recent-renewals"
import { ExpiringProductsList } from "@/components/expiring-products-list"
import {
  getTotalProductCount,
  getLastMonthAddedCount,
  getExpiringItemsCount,
  getLifetimeProductsCount,
  getRecentlyRenewedCount,
  getExpiringItems,
  getLifetimeProducts,
  getRecentlyRenewedItems,
} from "@/actions/items"
import DetailsModal from "@/components/item-details-modal"

export default async function DashboardPage({ searchParams }: { searchParams: { tab?: string } }) {
  const totalProducts = await getTotalProductCount()
  const lastMonthAdded = await getLastMonthAddedCount()
  const expiringSoonCount = await getExpiringItemsCount()
  const lifetimeProductsCount = await getLifetimeProductsCount()
  const recentlyRenewedCount = await getRecentlyRenewedCount()
  const expiringItems = await getExpiringItems()
  

  const params = await searchParams
  const tab = params?.tab || "overview"

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center font-semibold">
            <Package className="mr-2 h-6 w-6" />
            <span>Inventory System</span>
          </div>
        </div>
      </div>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <SideNav />
        <div className="flex-1 p-8 pt-6">
          <DashboardHeader
            heading="Inventory Dashboard"
            text="Manage your product inventory, track renewals, and monitor expiring items."
          />
          <Tabs value={tab} className="space-y-4">
            <TabsList>
              <TabsTrigger asChild value="overview">
                <Link href="/dashboard?tab=overview" passHref>Overview</Link>
              </TabsTrigger>
              <TabsTrigger asChild value="expiring">
                <Link href="/dashboard?tab=expiring" passHref>Expiring Products</Link>
              </TabsTrigger>
              <TabsTrigger asChild value="renewed">
                <Link href="/dashboard?tab=renewed" passHref>Recently Renewed</Link>
              </TabsTrigger>
              <TabsTrigger asChild value="lifetime">
                <Link href="/dashboard?tab=lifetime" passHref>Lifetime Products</Link>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <p className="text-xs text-muted-foreground">{lastMonthAdded} added in the last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{expiringSoonCount}</div>
                    <p className="text-xs text-muted-foreground">Expiring within 30 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recently Renewed</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recentlyRenewedCount}</div>
                    <p className="text-xs text-muted-foreground">In the last 30 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lifetime Products</CardTitle>
                    <Badge className="h-8 w-8 flex items-center justify-center text-4xl text-muted-foreground">∞</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{lifetimeProductsCount}</div>
                    <p className="text-xs text-muted-foreground">No renewal needed</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Renewals</CardTitle>
                    <CardDescription>Last 5 product renewals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card>
                <Card className="col-span-4 lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Expiring Products</CardTitle>
                    <CardDescription>Products that need attention soon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExpiringProductsList items={expiringItems.slice(0, 3)} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="expiring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Expiring Products</CardTitle>
                  <CardDescription>Products that will expire within the next 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpiringProductsTable />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="renewed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Renewed Products</CardTitle>
                  <CardDescription>Products that have been renewed in the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentlyRenewedTable />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="lifetime" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lifetime Products</CardTitle>
                  <CardDescription>Products with permanent licenses that don't require renewal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LifetimeProductsTable />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

async function ExpiringProductsTable() {
  const expiringItems = await getExpiringItems()

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product Name</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Expiration Date</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {expiringItems.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                No products expiring within 30 days.
              </td>
            </tr>
          ) : (
            expiringItems.map((item) => {
              const expiration = item.expirationDate ? new Date(item.expirationDate) : null

              let daysLeft: number | null = null
              if (expiration && !isNaN(expiration.getTime())) {
                daysLeft = Math.ceil((expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              }

              let badgeVariant: "default" | "outline" | "destructive" | "warning" | "secondary" | undefined = "outline"
              if (daysLeft !== null && daysLeft <= 7) badgeVariant = "destructive"
              else if (daysLeft !== null && daysLeft <= 14) badgeVariant = "warning"
              else if (daysLeft !== null && daysLeft > 14) badgeVariant = "default"

              return (
                <tr
                  key={item.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    <DetailsModal id={item.id}>
                      <button className="text-blue-600 hover:underline font-medium">{item.name}</button>
                    </DetailsModal>
                  </td>
                  <td className="p-4 align-middle">{item.owner ?? "N/A"}</td>
                  <td className="p-4 align-middle">
                    {expiration && !isNaN(expiration.getTime())
                      ? expiration.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                      : "N/A"}
                  </td>
                  <td className="p-4 align-middle">
                    {daysLeft !== null ? (
                      daysLeft < 0 ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant={badgeVariant}>
                          Expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                        </Badge>
                      )
                    ) : (
                      <Badge variant="secondary">No Expiry</Badge>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

async function LifetimeProductsTable() {
  const lifetimeItems = await getLifetimeProducts()

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product Name</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Purchase Date</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subscription Date</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">License Type</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {lifetimeItems.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                No lifetime products found.
              </td>
            </tr>
          ) : (
            lifetimeItems.map((item) => (
              <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">
                  <DetailsModal id={item.id}>
                    <button className="text-blue-600 hover:underline font-medium">{item.name}</button>
                  </DetailsModal>
                </td>
                <td className="p-4 align-middle">
                  {item.purchaseDate
                    ? new Date(item.purchaseDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </td>
                <td className="p-4 align-middle">
                  {item.subscriptionDate
                    ? new Date(item.subscriptionDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </td>
                <td className="p-4 align-middle">Lifetime</td>
                <td className="p-4 align-middle">{item.owner}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

async function RecentlyRenewedTable() {
  const recentRenewals = await getRecentlyRenewedItems()

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product Name</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Number of Licenses</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Renewal Date</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {recentRenewals.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-4 text-center text-muted-foreground">
                No recent renewals.
              </td>
            </tr>
          ) : (
            recentRenewals.map((renewal) => (
              <tr
                key={renewal.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">
                  {renewal.item?.id ? (
                    <DetailsModal id={renewal.item.id}>
                      <button className="text-blue-600 hover:underline font-medium">
                        {renewal.item?.name ?? "N/A"}
                      </button>
                    </DetailsModal>
                  ) : (
                    renewal.item?.name ?? "N/A"
                  )}
                </td>
                <td className="p-4 align-middle">{renewal.item?.numberOfLicenses ?? "N/A"}</td>
                <td className="p-4 align-middle">
                  {renewal.renewedAt
                    ? new Date(renewal.renewedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
