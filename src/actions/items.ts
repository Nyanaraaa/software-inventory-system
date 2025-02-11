"use server";

import prisma from "@/lib/prisma";
import type { Item, ItemUpdate } from "@/lib/types";

const createItem = async (data: Item) => {
    return prisma.item.create({
        data,
    });
};

const getItems = async (offset?: number, limit?: number) => {
    return prisma.item.findMany({
        skip: offset,
        take: limit,
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

const deleteItem = async (id: number) => {
    return prisma.item.delete({
        where: {
            id,
        },
    });
};

export {
    createItem,
    getItems,
    getExpiringItems,
    getItem,
    updateItem,
    deleteItem,
};
