import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const status = searchParams.get("status") 
  const page = Number.parseInt(searchParams.get("page") || "1")
  const itemsPerPage = 10

  try {
    
    const skip = (page - 1) * itemsPerPage

    
    const where: any = {}
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { contact: { contains: query, mode: "insensitive" } },
      ]
    }
    if (status) {
      where.status = status
    }

    
    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: itemsPerPage,
      include: {
        items: {
          select: { name: true }, 
        },
      },
    })

    
    const totalCount = await prisma.vendor.count({ where })

    return NextResponse.json({
      vendors,
      totalCount,
      totalPages: Math.ceil(totalCount / itemsPerPage),
    })
  } catch (error) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    
    if (!body.name) {
      return NextResponse.json({ error: "Vendor name is required" }, { status: 400 })
    }

    
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name,
        contact: body.contact || null,
        email: body.email || null,
        status: body.status || "ACTIVE", 
      },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error("Error creating vendor:", error)
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 })
    }

    if (!body.name) {
      return NextResponse.json({ error: "Vendor name is required" }, { status: 400 })
    }

    
    const vendor = await prisma.vendor.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        contact: body.contact || null,
        email: body.email || null,
        status: body.status || "ACTIVE",
      },
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error("Error updating vendor:", error)
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 })
  }
}
