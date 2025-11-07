import { NextResponse } from "next/server";
import db from "@/db";
import { billing as billingsTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { billingSchema } from "@/lib/validation/billingSchema";

/**
 * @openapi
 * /api/billings/{id}:
 *   get:
 *     summary: Get a billings by ID
 *     tags:
 *       - Billings
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
 *     summary: Update a billing by ID
 *     tags:
 *       - Billings
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
 *     summary: Delete a billing
 *     tags:
 *       - Billings
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
  const { id } = await params;
  const doctor = await db
    .select()
    .from(billingsTable)
    .where(eq(billingsTable.id, parseInt(id)))
    .get();
  // const validation = billingSchema.safeParse(id);
  // if (!validation.success) {
  //   return NextResponse.json(validation.error.format(), { status: 400 });
  // }
  if (!doctor) {
    return NextResponse.json({ error: "Not found", status: 404 });
  }
  return NextResponse.json(doctor);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const validation = billingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const { id } = params;
  const updated = await db
    .update(billingsTable)
    .set({
      patientId: body.patientId,
      appointmentId: body.appointmentId,
      amount: body.amount,
      status: body.status,
      paymentMethod: body.paymentMethod,
    })
    .where(eq(billingsTable.id, parseInt(id)))
    .returning()
    .get();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const ok = await db
    .delete(billingsTable)
    .where(eq(billingsTable.id, parseInt(id)))
    .returning()
    .get();
  const validation = billingSchema.safeParse(id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
