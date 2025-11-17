import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { pharmacy as pharmacyTable } from "@/db/schemas";
import { pharmacySchema } from "@/lib/validation/pharmacySchema";
import { auth } from "../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;

  // Admin, Doctor, and Patient can read all pharmacy items
  if (checkPermissions(userRole, "Pharmacy", "read")) {
    const pharmacy = await db.select({
      id: pharmacyTable.id,
      name: pharmacyTable.name,
      quantity: pharmacyTable.quantity,
      price: pharmacyTable.price,
      expiryDate: pharmacyTable.expiryDate,
    }).from(pharmacyTable);
    return NextResponse.json(pharmacy);
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;

  // Admin can create pharmacy items
  if (checkPermissions(userRole, "Pharmacy", "create")) {
    const data = await req.json();
    const validation = pharmacySchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }
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
    return NextResponse.json(pharmacy, { status: 201 });
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}