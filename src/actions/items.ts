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
    expirationDate: Date | null;
    itemType: ItemType;
    attachment: string;
    licenseKeys: string[];
    numberOfLicenses?: number;
    requisitionNumber?: string;
    vendorId?: string | number; // <-- Add this line
}) {
    const { licenseKeys, vendorId, ...itemData } = data;

    const item = await prisma.item.create({
        data: {
            ...itemData,
            vendorId: vendorId ? Number(vendorId) : undefined, // <-- Insert vendorId
            licenseKeys: {
                create: licenseKeys.map((key) => ({
                    key,
                    status: "active",
                })),
            },
        },
    });

    return item;
}

const getItems = async (offset = 0, limit = 10) => {
  return prisma.item.findMany({
    skip: offset,
    take: limit,
    orderBy: { id: "desc" },
    include: {
      licenseKeys: true,
      vendor: true, // <-- include vendor relation
    },
  });
};

const getExpiringItems = async () => {
    const now = new Date();
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return prisma.item.findMany({
        where: {
            expirationDate: {
                gte: now,      // Only items expiring in the future
                lte: oneMonth, // ...and within the next 30 days
            },
        },
        orderBy: {
            expirationDate: "asc",
        },
    });
};

const getExpiringItemsCount = async () => {
    const oneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return prisma.item.count({
        where: {
            expirationDate: {
                lte: oneMonth,
                gte: new Date(),
            },
        },
    });
};

const getExpiredItemsCount = async () => {
  return prisma.item.count({
    where: {
      expirationDate: {
        lt: new Date(),
      },
    },
  });
};

const getItem = async (id: number) => {
  return prisma.item.findUnique({
    where: { id },
    include: {
      licenseKeys: true,
      vendor: true, // <-- ensure vendor relation is included
    },
  });
};


const updateItem = async (id: number, data: any) => {
  const { licenseKeys, vendorId, ...itemData } = data;

  return prisma.item.update({
    where: { id },
    data: {
      ...itemData,
      vendorId: vendorId ? Number(vendorId) : null, // <-- update vendorId
      licenseKeys: licenseKeys
        ? {
            deleteMany: {},
            create: licenseKeys.map((key: string) => ({ key, status: "active" })),
          }
        : undefined,
    },
    include: { licenseKeys: true },
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

const updateLicenseKeyStatus = async (licenseKeyId: number, status: string) => {
    return prisma.licenseKey.update({
        where: { id: licenseKeyId },
        data: { status },
    });
};

const getTotalProductCount = async () => {
    return prisma.item.count();
};

const getLastMonthAddedCount = async () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return prisma.item.count({
        where: {
            createdAt: {
                gte: lastMonth,
                lt: now,
            },
        },
    });
};

const getLifetimeProductsCount = async () => {
    return prisma.item.count({
        where: {
            expirationDate: null,
        },
    });
};

export const renewItem = async (id: number, data: ItemUpdate) => {
  // Update the item
  await prisma.item.update({
    where: { id },
    data,
  });
  // Log the renewal
  await prisma.renewal.create({
    data: {
      itemId: id,
    },
  });
};

export const getRecentlyRenewedCount = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return prisma.renewal.count({
    where: {
      renewedAt: {
        gte: thirtyDaysAgo,
        lte: now,
      },
    },
  });
};

export const getLifetimeProducts = async () => {
  return prisma.item.findMany({
    where: { expirationDate: null },
    orderBy: { purchaseDate: "desc" },
  });
};

export const getRecentlyRenewedItems = async (opts?: { all?: boolean }) => {
  if (opts?.all) {
    // Get the latest renewal for each item (one row per item)
    const renewals = await prisma.renewal.findMany({
      orderBy: [
        { itemId: "asc" },
        { renewedAt: "desc" }
      ],
      include: { item: true },
    });

    // Deduplicate by itemId, keeping only the most recent renewal per item
    const seen = new Set();
    const uniqueRenewals = [];
    for (const renewal of renewals) {
      if (!seen.has(renewal.itemId)) {
        uniqueRenewals.push(renewal);
        seen.add(renewal.itemId);
      }
    }
    return uniqueRenewals;
  }
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get the latest renewal for each item in the last 30 days
  const renewals = await prisma.renewal.findMany({
    where: {
      renewedAt: {
        gte: thirtyDaysAgo,
        lte: now,
      },
    },
    orderBy: [
      { renewedAt: "desc" }
    ],
    distinct: ["itemId"], // Only the latest renewal per item
    take: 5, // Limit to 5 items
    include: { item: true },
  });

  return renewals;
};

export const getTotalRenewalsCount = async () => {
  return prisma.renewal.count();
};

export const getLastMonthRenewalsCount = async () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  return prisma.renewal.count({
    where: {
      renewedAt: {
        gte: lastMonth,
        lt: now,
      },
    },
  });
};

const getExpiredProducts = async () => {
  return prisma.item.findMany({
    where: {
      expirationDate: {
        lt: new Date(),
      },
    },
    orderBy: {
      expirationDate: "asc",
    },
    select: {
      id: true,
      name: true,
      expirationDate: true,
      owner: true,
      numberOfLicenses: true,
    },
  });
};

const renewals = await getRecentlyRenewedItems({ all: true })

export {
    getItems,
    getExpiringItems,
    getItem,
    updateItem,
    archiveItem,
    unarchiveItem,
    updateLicenseKeyStatus,
    getTotalProductCount,
    getLastMonthAddedCount,
    getExpiringItemsCount,
    getLifetimeProductsCount,
    getExpiredItemsCount,
    getExpiredProducts, // <-- add this line
};

