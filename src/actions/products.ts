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

export { createProduct, getProducts, getProduct, updateProduct, deleteProduct };
