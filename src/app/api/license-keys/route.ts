import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Create a license key
export async function POST(req: NextRequest) {
  const { key, status, itemId } = await req.json()
  if (!key || !itemId) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
  }
  try {
    const licenseKey = await prisma.licenseKey.create({
      data: { key, status, itemId },
    })
    return NextResponse.json(licenseKey)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "License key already exists." }, { status: 400 })
    }
    return NextResponse.json({ message: "Failed to add license key." }, { status: 500 })
  }
}

// Update license key status
export async function PUT(req: NextRequest) {
  const { id, status } = await req.json()
  if (!id || !status) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
  }
  try {
    const updated = await prisma.licenseKey.update({
      where: { id: Number(id) },
      data: { status },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: "Failed to update license key status." }, { status: 500 })
  }
}