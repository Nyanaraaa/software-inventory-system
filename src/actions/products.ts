"use server";

import prisma from "@/lib/prisma";
import type { Item, ItemUpdate } from "@/lib/types";

const createProduct = async (data: Item) => {
  return prisma.product.create({
    data,
  });
};

const getProducts = async (offset: number = 0, limit: number = 10) => {
  return prisma.product.findMany({
    skip: offset,
    take: limit,
  });
};

const updateProduct = async (id: number, data: ItemUpdate) => {
  return prisma.product.update({
    where: {
      id,
    },
    data,
  });
};

const deleteProduct = async (id: number) => {
  return prisma.product.delete({
    where: {
      id,
    },
  });
};

export { createProduct, getProducts, updateProduct, deleteProduct };
