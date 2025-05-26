import { NextRequest, NextResponse } from "next/server";
import { getExpiredProducts } from "@/actions/items";

export async function GET(req: NextRequest) {
  try {
    const expiredProducts = await getExpiredProducts();
    return NextResponse.json(expiredProducts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expired products" }, { status: 500 });
  }
}