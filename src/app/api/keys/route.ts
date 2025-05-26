import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query") || ""
  const status = searchParams.get("status") || "all"
  const page = parseInt(searchParams.get("page") || "1")
  const itemsPerPage = 10
  const skip = (page - 1) * itemsPerPage

  const where: any = {
    ...(query
      ? {
          OR: [
            { key: { contains: query, mode: "insensitive" } },
            { item: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(status && status !== "all" ? { status } : {}),
  }

  const licenseKeys = await prisma.licenseKey.findMany({
    where,
    include: { item: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: itemsPerPage,
  })

  const totalCount = await prisma.licenseKey.count({ where })
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return NextResponse.json({ licenseKeys, totalCount, totalPages })
}