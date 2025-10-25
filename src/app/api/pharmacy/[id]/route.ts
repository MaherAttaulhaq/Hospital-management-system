import { NextResponse } from "next/server";
import db from "@/db";
import { pharmacy as pharmacyTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { patientSchema } from "@/lib/validation/patientSchema";
/**
 * @openapi
 * /api/pharmacy/{id}:
 *   get:
 *     summary: Get a pharmacy by ID
 *     tags:
 *       - Pharmacy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       '404':
 *         description: Not found
 *   put:
 *     summary: Update a pharmacy 
 *     tags:
 *       - Pharmacy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       '200':
 *         description: Updated
 *   delete:
 *     summary: Delete a doctor
 *     tags:
 *       - Pharmacy
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Deleted
 */

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const patient = await db
    .select()
    .from(pharmacyTable)
    .where(eq(pharmacyTable.id, parseInt(id)))
    .get();
  const validation = patientSchema.safeParse(id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!patient) {
    return NextResponse.json({ error: "Not found", status: 404 });
  }
  return NextResponse.json(patient);
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { id } = params;
  const updated = await db
    .update(pharmacyTable)
    .set({
      name: body.name,
      quantity: body.quantity,
      price: body.price,
      expiryDate: body.expiryDate,
    })
    .where(eq(pharmacyTable.id, parseInt(id)))
    .returning()
    .get();
    const validation = patientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }
  if (!updated) return NextResponse.json({ error: "Not found", status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const ok = await db
    .delete(pharmacyTable)
    .where(eq(pharmacyTable.id, parseInt(params.id)))
    .returning()
    .get();
  const validation = patientSchema.safeParse(params.id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

