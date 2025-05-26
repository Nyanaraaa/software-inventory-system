"use server";

import prisma from "@/lib/prisma";

/**
 * Create a new vendor in the database.
 * @param data - Vendor data: name, contact, email.
 */
export async function createVendor(data: {
  name: string;
  contact: string;
  email: string;
}) {
  return prisma.vendor.create({
    data: {
      name: data.name,
      contact: data.contact,
      email: data.email,
    },
  });
}

/**
 * Fetch all vendors from the database.
 * @returns Array of vendors.
 */
export async function getVendors() {
  return prisma.vendor.findMany({
    orderBy: { name: "asc" },
  });
}