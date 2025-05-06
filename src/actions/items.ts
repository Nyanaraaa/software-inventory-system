"use server";

import prisma from "@/lib/prisma";
import type { Item, ItemUpdate } from "@/lib/types";
import { ItemType } from "@prisma/client";

export async function createItem(data: {
    name: string;
    description: string;
    owner: string;
    ownerEmail: string;
    subscriptionDate?: Date;
    purchaseDate?: Date;
    expirationDate: Date;
    itemType: ItemType;
    attachment: string;
    licenseKey?: string;
    numberOfLicenses?: number;
    requisitionNumber?: string; 
}) {
    return await prisma.item.create({
        data,
    });
}

const getItems = async (offset = 0, limit = 10) => {
    return prisma.item.findMany({
        skip: offset,
        take: limit,
        orderBy: {
            id: "desc", // Fetch the most recent items first
        },
    });
};

const getExpiringItems = async () => {
    const oneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return prisma.item.findMany({
        where: {
            expirationDate: {
                lte: oneMonth,
            },
        },
    });
};

const getItem = async (id: number) => {
    return prisma.item.findUnique({
        where: {
            id,
        },
    });
};


const updateItem = async (id: number, data: ItemUpdate) => {
    return prisma.item.update({
        where: {
            id,
        },
        data,
    });
};

const archiveItem = async (ids: number[]) => {
    return prisma.item.updateMany({
        where: {
            id: {
                in: ids, // Match any of the provided IDs
            },
        },
        data: {
            archived: true,
        },
    });
};

const unarchiveItem = async (ids: number[]) => {
    return prisma.item.updateMany({
        where: {
            id: {
                in: ids, // Match any of the provided IDs
            },
        },
        data: {
            archived: false,
        },
    });
};

export {
    getItems,
    getExpiringItems,
    getItem,
    updateItem,
    archiveItem,
    unarchiveItem,
};
