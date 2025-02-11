"use client";

import CreateItemModal from "@/components/add-modal";
import EditItemModal from "@/components/edit-modal";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getItems, deleteItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { truncate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { DisplayedItems } from "@/lib/types";

export default function Home() {
  const searchParams = useSearchParams();
  const page = Number.parseInt(searchParams.get("page") ?? "1") - 1;
  const now = new Date();
  const [data, setData] = useState<DisplayedItems[]>([]);
  const [displayData, setDisplayData] = useState<DisplayedItems[]>([]);

  const textDateColor = (date: Date | undefined) => {
    if (!date) return "inherit";

    if (date < now) return "red";
    if (date < new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)) {
      return "orange";
    }
    return "inherit";
  };

  const updateData = async () => {
    const temp = [];
    const res = await getItems(page * 10, 10);

    for (const e of res) {
      temp.push({
        id: e.id,
        name: e.name,
        owner: e.owner,
        subscriptionDate: e.subscriptionDate ?? undefined,
        expirationDate: e.expirationDate ?? undefined,
        purchaseDate: e.purchaseDate ?? undefined,
        type: e.itemType,
      });
    }

    setDisplayData(temp);
    setData(temp);
  };

  useEffect(() => {
    updateData();
  }, []);

  return (
    <div className="h-dvh bg-muted ">
      <div className="w-full font-bold h-20 flex items-center justify-center text-2xl">
        Inventory System
      </div>
      <div className="w-full flex justify-center">
        <div className="flex justify-between mb-2 w-[90%]">
          <Input
            placeholder="Search..."
            className="w-[20%] h-10 bg-background"
            onChange={(e) => {
              setDisplayData(
                data.filter((item) =>
                  item.name
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase())
                )
              );
            }}
          />
          <CreateItemModal updateData={updateData} />
        </div>
      </div>
      <div className="flex justify-center">
        <div className="overflow-x-auto shadow-md sm:rounded-lg w-[90%]">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Owner
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 hidden md:table-cell"
                >
                  Purchase Date (Hardware)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 hidden md:table-cell"
                >
                  Subscription Date (Software)
                </th>
                <th scope="col" className="px-6 py-3">
                  Expiration Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 hidden sm:table-cell"
                >
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map((e, i) => {
                  return (
                    <tr
                      key={i}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <th
                        scope="row"
                        className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {truncate(e.name, 20)}
                      </th>
                      <td className="px-6 py-2">
                        {e.owner}
                      </td>
                      <td className="px-6 py-2 hidden md:table-cell">
                        {e.purchaseDate?.toLocaleDateString() ??
                          "N/A"}
                      </td>
                      <td className="px-6 py-2 hidden md:table-cell">
                        {e.subscriptionDate?.toLocaleDateString() ??
                          "N/A"}
                      </td>
                      <td
                        className="px-6 py-2"
                        style={{
                          color: textDateColor(
                            e.expirationDate
                          ),
                        }}
                      >
                        {e.expirationDate?.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-2 hidden sm:table-cell">
                        {e.type}
                      </td>
                      <td className="px-6 py-2 text-right">
                        <div className="flex gap-2">
                          <EditItemModal
                            id={e.id}
                            updateData={updateData}
                          />
                          <Button
                            onClick={() => {
                              deleteItem(e.id)
                                .then(() =>
                                  updateData()
                                )
                                .catch((err) =>
                                  console.error(
                                    err
                                  )
                                );
                            }}
                            className="bg-red-500 hover:bg-red-700 rounded p-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              color="#ffff"
                              fill="none"
                            >
                              <path
                                d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M9.5 16.5L9.5 10.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M14.5 16.5L14.5 10.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-2 text-center"
                  >
                    No data to show
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
