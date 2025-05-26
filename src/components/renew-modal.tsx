"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import type { DisplayedItems } from "@/lib/types";

interface RenewModalProps {
  open: boolean;
  onClose: () => void;
  selectedItem: DisplayedItems | null;
  newSubscriptionDate: Date | null;
  setNewSubscriptionDate: (date: Date | null) => void;
  newPurchaseDate: Date | null;
  setNewPurchaseDate: (date: Date | null) => void;
  newExpirationDate: Date | null;
  setNewExpirationDate: (date: Date | null) => void;
  onConfirm: () => Promise<void>;
}

export default function RenewModal({
  open,
  onClose,
  selectedItem,
  newSubscriptionDate,
  setNewSubscriptionDate,
  newPurchaseDate,
  setNewPurchaseDate,
  newExpirationDate,
  setNewExpirationDate,
  onConfirm,
}: RenewModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative z-10">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            Renew Item
          </Dialog.Title>
          {selectedItem && (
            <div className="space-y-4">
              <p className="text-gray-700 font-medium">{selectedItem.name}</p>

              {selectedItem.type === "SOFTWARE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Subscription Date
                  </label>
                  <input
                    type="date"
                    value={newSubscriptionDate?.toISOString().split("T")[0] || ""}
                    onChange={(e) =>
                      setNewSubscriptionDate(
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
              )}

              {selectedItem.type === "HARDWARE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onConfirm}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Confirm Renewal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}