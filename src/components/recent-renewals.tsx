import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getRecentlyRenewedItems } from "@/actions/items";
import DetailsModal from "@/components/item-details-modal"

export async function RecentSales() {
  const recentRenewals = await getRecentlyRenewedItems();

  return (
    <div className="space-y-8">
      {recentRenewals.length === 0 ? (
        <div className="text-center text-muted-foreground">No recent renewals.</div>
      ) : (
        recentRenewals.map((renewal) => (
          <div key={renewal.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {renewal.item.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                <DetailsModal id={renewal.item.id}>
                  <button className="text-blue-600 hover:underline font-medium">{renewal.item.name}</button>
                </DetailsModal>
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(renewal.renewedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="ml-auto font-medium">
              {renewal.item.numberOfLicenses ?? "N/A"} Licenses
            </div>
          </div>
        ))
      )}
    </div>
  );
}
