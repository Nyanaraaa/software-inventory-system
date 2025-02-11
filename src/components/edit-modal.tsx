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
  });

  const handleSubmit = async () => {
    await updateItem(id, {
      name: data.productName,
      owner: data.owner,
      expirationDate: data.expirationDate,
      subscriptionDate: data.subscriptionDate,
      purchaseDate: data.purchaseDate,
      itemType:
        data.category === "software" ? ItemType.SOFTWARE : ItemType.HARDWARE,
      attachment: data.attachment,
      ownerEmail: data.ownerEmail,
      description: data.productDescription,
    });
    updateData();
  };

  useEffect(() => {
    const updateExisting = async () => {
      const res = await getItem(id);

      setData({
        productName: res!.name,
        owner: res!.owner,
        expirationDate: res!.expirationDate,
        subscriptionDate: res?.subscriptionDate as Date | undefined,
        purchaseDate: res?.purchaseDate as Date | undefined,
        category: res!.itemType,
        attachment: res!.attachment,
        ownerEmail: res!.ownerEmail,
        productDescription: res!.description,
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
            className="bg-blue-500 hover:bg-blue-700 text-white p-2"
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
                d="M15.2141 5.98239L16.6158 4.58063C17.39 3.80646 18.6452 3.80646 19.4194 4.58063C20.1935 5.3548 20.1935 6.60998 19.4194 7.38415L18.0176 8.78591M15.2141 5.98239L6.98023 14.2163C5.93493 15.2616 5.41226 15.7842 5.05637 16.4211C4.70047 17.058 4.3424 18.5619 4 20C5.43809 19.6576 6.94199 19.2995 7.57889 18.9436C8.21579 18.5877 8.73844 18.0651 9.78375 17.0198L18.0176 8.78591M15.2141 5.98239L18.0176 8.78591"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 20H17"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Make changes to the item. Click save when you're done.
            </DialogDescription>
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
                <select
                  id="category"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  value={data.category}
                  disabled
                >
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                </select>
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
              className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Save changes
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
