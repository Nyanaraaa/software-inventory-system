"use client";

import { useState, useEffect } from "react";
import { getItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function DetailsModal({ id }: { id: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getItem(id);
      setData(res);
    };

    fetchData();
  }, [id]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-transparent hover:bg-transparent text-white p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-5 w-5 text-black"
          >
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            <path
              fillRule="evenodd"
              d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
        </DialogHeader>
        {data ? (
          <div className="grid gap-4">
            <div>
              <strong>Name:</strong> {data.name}
            </div>
            <div>
              <strong>Owner:</strong> {data.owner}
            </div>
            <div>
              <strong>Owner Email:</strong> {data.ownerEmail}
            </div>
            <div>
              <strong>Category:</strong> {data.itemType}
            </div>
            {data.itemType === "HARDWARE" && (
              <div>
                <strong>Purchase Date:</strong>{" "}
                {data.purchaseDate
                  ? new Date(data.purchaseDate).toLocaleDateString()
                  : "N/A"}
              </div>
            )}
            {data.itemType === "SOFTWARE" && (
              <>
                <div>
                  <strong>Subscription Date:</strong>{" "}
                  {data.subscriptionDate
                    ? new Date(data.subscriptionDate).toLocaleDateString()
                    : "N/A"}
                </div>
                <div>
                  <strong>License Key:</strong> {data.licenseKey || "N/A"}
                </div>
                <div>
                  <strong>Number of Licenses:</strong>{" "}
                  {data.numberOfLicenses || "N/A"}
                </div>
              </>
            )}
            <div>
              <strong>Expiration Date:</strong>{" "}
              {data.expirationDate
                ? new Date(data.expirationDate).toLocaleDateString()
                : "N/A"}
            </div>
            <div>
              <strong>Requisition Number:</strong>{" "}
              {data.requisitionNumber || "N/A"}
            </div>
            <div>
              <strong>Description:</strong> {data.description || "N/A"}
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="secondary"
              className="text-white bg-black hover:bg-gray-800"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}