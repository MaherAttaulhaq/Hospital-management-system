import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { pharmacy as pharmacyTable } from "@/db/schemas";
import { pharmacySchema } from "@/lib/validation/pharmacySchema";

/**
 * @openapi
 * /api/pharmacy:
 *   get:
 *     summary: List all pharmacy items
 *     tags:
 *       - Pharmacy
 *     responses:
 *       '200':
 *         description: A list of pharmacy items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   quantity:
 *                     type: integer
 *                   price:
 *                     type: number
 *                   expiryDate:
 *                     type: string
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
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               expiryDate:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Pharmacy item created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 price:
 *                   type: number
 *                 expiryDate:
 *                   type: string
 *       '400':
 *         description: Invalid input
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

  const validation = pharmacySchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  return NextResponse.json(pharmacy, { status: 201 });
}