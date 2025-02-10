"use server";

import prisma from "@/lib/prisma";
import type { Item, ItemUpdate } from "@/lib/types";

const createProduct = async (data: Item) => {
  return prisma.item.create({
    data,
  });
};

const getProducts = async (offset?: number, limit?: number) => {
  return prisma.item.findMany({
    skip: offset,
    take: limit,
  });
};

const getExpiringProducts = async () => {
  const oneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return prisma.item.findMany({
    where: {
      expirationDate: {
        lte: oneMonth
      }
    }
  })
}

const getProduct = async (id: number) => {
  return prisma.item.findUnique({
    where: {
      id,
    },
  });
};

const updateProduct = async (id: number, data: ItemUpdate) => {
  return prisma.item.update({
    where: {
      id,
    },
    data,
  });
};

const deleteProduct = async (id: number) => {
  return prisma.item.delete({
    where: {
      id,
    },
  });
};

export { createProduct, getProducts, getExpiringProducts, getProduct, updateProduct, deleteProduct };
