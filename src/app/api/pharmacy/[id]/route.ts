import { NextResponse } from "next/server";
import db from "@/db";
import { pharmacy as pharmacyTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { pharmacySchema } from "@/lib/validation/pharmacySchema";
import { auth } from "./../../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/rbac";

/**
 * @openapi
 * /api/pharmacy/{id}:
 *   get:
 *     summary: Get a pharmacy by ID
 *     tags:
 *       - Pharmacy
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not found
 *   put:
 *     summary: Update a pharmacy
 *     tags:
 *       - Pharmacy
 *     responses:
 *       '200':
 *         description: Updated
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   delete:
 *     summary: Delete a doctor
 *     tags:
 *       - Pharmacy
 *     responses:
 *       '204':
 *         description: Deleted
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("from pharmacy server");
  console.log("API Route received cookie:", req.headers.get('cookie'));

  const session = await auth();
  console.log("session from pharmacy", session);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const pharmacyId = parseInt(params.id);

  const pharmacyItem = await db
    .select({
      id: pharmacyTable.id,
      name: pharmacyTable.name,
      quantity: pharmacyTable.quantity,
      price: pharmacyTable.price,
      expiryDate: pharmacyTable.expiryDate,
    })
    .from(pharmacyTable)
    .where(eq(pharmacyTable.id, pharmacyId))
    .get();

  if (!pharmacyItem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Admin, Doctor, and Patient can read a specific pharmacy item
  if (checkPermissions(userRole, "Pharmacy", "read")) {
    return NextResponse.json(pharmacyItem);
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const pharmacyId = parseInt(params.id);

  const body = await req.json();
  const validation = pharmacySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  // Admin can update a specific pharmacy item
  if (checkPermissions(userRole, "Pharmacy", "update")) {
    const updated = await db
      .update(pharmacyTable)
      .set({
        name: body.name,
        quantity: body.quantity,
        price: body.price,
        expiryDate: body.expiryDate,
      })
      .where(eq(pharmacyTable.id, pharmacyId))
      .returning()
      .get();

    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const pharmacyId = parseInt(params.id);

  // Admin can delete a specific pharmacy item
  if (checkPermissions(userRole, "Pharmacy", "delete")) {
    const ok = await db
      .delete(pharmacyTable)
      .where(eq(pharmacyTable.id, pharmacyId))
      .returning()
      .get();
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
