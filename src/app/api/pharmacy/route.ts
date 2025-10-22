import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { pharmacy as pharmacyTable } from "@/db/schemas";

/**
 * @openapi
 * /api/pharmacy:
 *   get:
 *     summary: List all pharmacy items
 *     tags:
 *       - Pharmacy
 *     responses:
 *       '200':
 *         description: OK
 *   post:
 *     summary: Create a pharmacy item
 *     tags:
 *       - Pharmacy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '201':
 *         description: Created
 */
export async function GET() {
  const pharmacy = await db.select().from(pharmacyTable);
  return NextResponse.json(pharmacy);
}

export async function POST(req: Request) {
  const data = await req.json();
  console.log("data", data);
  const pharmacy = await db
    .insert(pharmacyTable)
    .values({
      name: data.name,
      quantity: data.quantity,
      price: data.price,
      expiryDate: data.expiryDate,
    } as any)
    .returning()
    .get();

  console.log("pharmacy", pharmacy);

  return NextResponse.json(pharmacy, { status: 201 });
}