"use client";

import { useState } from "react";
import { createItem } from "@/actions/items";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ItemType } from "@prisma/client";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function CreateItemModal({
    updateData,
}: {
    updateData: () => void;
}) {
    const [open, setOpen] = useState(false);
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
        licenseKey: "",
        numberofLicenses: 0,
        requisitionNumber: "",
    });

    const postProduct = async () => {
        await createItem({
            name: data.productName,
            description: data.productDescription,
            owner: data.owner,
            ownerEmail: data.ownerEmail,
            subscriptionDate: data.subscriptionDate,
            purchaseDate: data.purchaseDate,
            expirationDate: data.expirationDate!,
            itemType:
                data.category === "software"
                    ? ItemType.SOFTWARE
                    : ItemType.HARDWARE,
            attachment: data.attachment,
            licenseKey: data.licenseKey,
            numberOfLicenses: data.numberofLicenses,
            requisitionNumber: data.requisitionNumber,
        });

        setData({
            productName: "",
            owner: "",
            expirationDate: undefined,
            subscriptionDate: undefined,
            purchaseDate: undefined,
            category: "",
            attachment: "",
            ownerEmail: "",
            productDescription: "",
            licenseKey: "",
            numberofLicenses: 0,
            requisitionNumber: "",
        });

        updateData();
        setOpen(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="secondary"
                        className="bg-black hover:bg-gray-800 text-white rounded p-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-8 h-8"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Add New Product
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                    </DialogHeader>
                    <form id="create-item" action={postProduct}>
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
                                        setData({
                                            ...data,
                                            productName: e.target.value,
                                        })
                                    }
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Type product name"
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
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            owner: e.target.value,
                                        })
                                    }
                                    type="text"
                                    name="owner"
                                    id="owner"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Type owner name"
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
                                        setData({
                                            ...data,
                                            ownerEmail: e.target.value,
                                        })
                                    }
                                    type="text"
                                    name="owner-email"
                                    id="owner-email"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="email@ub.edu.ph"
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
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            category: e.target.value,
                                        })
                                    }
                                    id="category"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    required
                                >
                                    <option value="">Select category</option>
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
                                                    setData({
                                                        ...data,
                                                        subscriptionDate: v,
                                                    });
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
                                                    console.log(v)
                                                    setData({
                                                        ...data,
                                                        purchaseDate: v,
                                                    });
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
                                                setData({
                                                    ...data,
                                                    expirationDate: v,
                                                });
                                            }}
                                            isExpiration={true}
                                        />
                                    </div>
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
                                                        setData({
                                                            ...data,
                                                            licenseKey: e.target.value,
                                                        })
                                                    }
                                                    type="text"
                                                    name="license-key"
                                                    id="license-key"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Enter license key"
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
                                                            numberofLicenses: parseInt(e.target.value) || 0,
                                                        })
                                                    }
                                                    type="number"
                                                    name="number-of-licenses"
                                                    id="number-of-licenses"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    placeholder="Enter number of licenses"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
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
                                        setData({
                                            ...data,
                                            attachment: e.target.value,
                                        })
                                    }
                                    type="text"
                                    name="attachment"
                                    id="attachment"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Type google drive link"
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
                                        setData({
                                            ...data,
                                            requisitionNumber: e.target.value,
                                        })
                                    }
                                    type="text"
                                    name="requisition-number"
                                    id="requisition-number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="Enter requisition number"
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
                                        setData({
                                            ...data,
                                            productDescription: e.target.value,
                                        })
                                    }
                                    id="description"
                                    rows={4}
                                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Write product description here"
                                ></Textarea>
                            </div>
                        </div>
                    </form>
                    <DialogFooter>
                        <Button
                            type="submit"
                            form="create-item"
                             className="text-white inline-flex items-center  bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
