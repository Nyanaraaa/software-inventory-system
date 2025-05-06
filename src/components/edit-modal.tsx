"use client";

import { useState, useEffect } from "react";
import { getItem, updateItem } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ItemType } from "@prisma/client";

export default function EditItemModal({
  id,
  updateData,
}: {
  id: number;
  updateData: () => void;
}) {
  const [data, setData] = useState({
    productName: "",
    owner: "",
    expirationDate: undefined as Date | undefined,
    subscriptionDate: undefined as Date | undefined,
    purchaseDate: undefined as Date | undefined,
    category: "",
    attachment: "",
    ownerEmail: "",
    productDescription: "",
    licenseKey: "", // New field
    numberOfLicenses: 0, // New field
    requisitionNumber: "", // New field
  });

  const handleSubmit = async () => {
    const normalizeDate = (date?: Date) => {
      if (!date) return undefined;
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
    };

    await updateItem(id, {
      name: data.productName,
      owner: data.owner,
      expirationDate: normalizeDate(data.expirationDate),
      subscriptionDate: normalizeDate(data.subscriptionDate),
      purchaseDate: normalizeDate(data.purchaseDate),
      itemType:
        data.category === "software" ? ItemType.SOFTWARE : ItemType.HARDWARE,
      attachment: data.attachment,
      ownerEmail: data.ownerEmail,
      description: data.productDescription,
      licenseKey: data.licenseKey,
      numberOfLicenses: data.numberOfLicenses,
      requisitionNumber: data.requisitionNumber,
    });
    updateData();
  };

  useEffect(() => {
    const updateExisting = async () => {
      const res = await getItem(id);

      setData({
        productName: res!.name,
        owner: res!.owner,
        expirationDate: res?.expirationDate ?? undefined,
        subscriptionDate: res?.subscriptionDate as Date | undefined,
        purchaseDate: res?.purchaseDate as Date | undefined,
        category: res!.itemType.toLowerCase(), // Normalize to lowercase
        attachment: res!.attachment,
        ownerEmail: res!.ownerEmail,
        productDescription: res!.description,
        licenseKey: res?.licenseKey ?? "", // Default or existing value
        numberOfLicenses: res?.numberOfLicenses ?? 0, // Default or existing value
        requisitionNumber: res?.requisitionNumber ?? "", // Default or existing value
      });
    };

    updateExisting();
  }, [id]);

  return (
    <>
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
              <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
              <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
            </svg>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <form id="update-item" action={handleSubmit}>
            <div className="grid gap-4 mb-4 grid-cols-2">
              <div className="col-span-2">
                <Label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Name
                </Label>
                <Input
                  onChange={(e) =>
                    setData({ ...data, productName: e.target.value })
                  }
                  type="text"
                  name="name"
                  id="name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Type product name"
                  value={data.productName}
                  required
                />
              </div>
              <div className="col-span-1">
                <Label
                  htmlFor="owner"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Owner
                </Label>
                <Input
                  onChange={(e) => setData({ ...data, owner: e.target.value })}
                  type="text"
                  name="owner"
                  id="owner"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Type owner name"
                  value={data.owner}
                  required
                />
              </div>
              <div className="col-span-1">
                <Label
                  htmlFor="owner-email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Owner Email
                </Label>
                <Input
                  onChange={(e) =>
                    setData({ ...data, ownerEmail: e.target.value })
                  }
                  type="text"
                  name="owner-email"
                  id="owner-email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="email@ub.edu.ph"
                  value={data.ownerEmail}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Category
                </Label>
                <div
                  id="category"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  {data.category === "software" ? "Software" : "Hardware"}
                </div>
              </div>
              {data.category && (
                <>
                  {data.category === "software" ? (
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="sub-date"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Subscription Date
                      </Label>
                      <DatePicker
                        date={data.subscriptionDate}
                        setDate={(v?: Date) => {
                          setData({ ...data, subscriptionDate: v });
                        }}
                        isExpiration={false}
                      />
                    </div>
                  ) : (
                    <div className="col-span-2 sm:col-span-1">
                      <Label
                        htmlFor="sub-date"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Purchase Date
                      </Label>
                      <DatePicker
                        date={data.purchaseDate}
                        setDate={(v?: Date) => {
                          setData({ ...data, purchaseDate: v });
                        }}
                        isExpiration={false}
                      />
                    </div>
                  )}
                  <div className="col-span-2 sm:col-span-1">
                    <Label
                      htmlFor="exp-date"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Expiration Date
                    </Label>
                    <DatePicker
                      date={data.expirationDate}
                      setDate={(v?: Date) => {
                        setData({ ...data, expirationDate: v });
                      }}
                      isExpiration={true}
                    />
                  </div>
                </>
              )}
              {data.category === "software" && (
                <>
                  <div className="col-span-2">
                    <Label
                      htmlFor="license-key"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      License Key
                    </Label>
                    <Input
                      onChange={(e) =>
                        setData({ ...data, licenseKey: e.target.value })
                      }
                      type="text"
                      name="license-key"
                      id="license-key"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Enter license key"
                      value={data.licenseKey}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label
                      htmlFor="number-of-licenses"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Number of Licenses
                    </Label>
                    <Input
                      onChange={(e) =>
                        setData({
                          ...data,
                          numberOfLicenses: parseInt(e.target.value) || 0,
                        })
                      }
                      type="number"
                      name="number-of-licenses"
                      id="number-of-licenses"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Enter number of licenses"
                      value={data.numberOfLicenses}
                      required
                    />
                  </div>
                </>
              )}
              <div className="col-span-2">
                <Label
                  htmlFor="attachment"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Attachment
                </Label>
                <Input
                  onChange={(e) =>
                    setData({ ...data, attachment: e.target.value })
                  }
                  type="text"
                  name="attachment"
                  id="attachment"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Type google drive link"
                  value={data.attachment}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor="requisition-number"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Requisition Number
                </Label>
                <Input
                  onChange={(e) =>
                    setData({ ...data, requisitionNumber: e.target.value })
                  }
                  type="text"
                  name="requisition-number"
                  id="requisition-number"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Enter requisition number"
                  value={data.requisitionNumber}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Product Description
                </Label>
                <Textarea
                  onChange={(e) =>
                    setData({ ...data, productDescription: e.target.value })
                  }
                  id="description"
                  rows={4}
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Write product description here"
                  value={data.productDescription}
                ></Textarea>
              </div>
            </div>
          </form>
          <DialogFooter>
            <DialogClose
              type="submit"
              form="update-item"
              className="text-white inline-flex items-center  bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Update
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
