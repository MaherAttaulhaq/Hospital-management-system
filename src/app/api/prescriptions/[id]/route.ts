import { NextResponse } from "next/server";
import db from "@/db";
import { prescriptions as prescriptionsTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { prescriptionSchema } from "@/lib/validation/prescriptionSchema";

/**
 * @openapi
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags:
 *       - Prescriptions
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
 *     summary: Update a prescription
 *     tags:
 *       - Prescriptions
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
 *     summary: Delete a prescription
 *     tags:
 *       - Prescriptions
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
    .from(prescriptionsTable)
    .where(eq(prescriptionsTable.id, parseInt(id)))
    .get();
  const validation = prescriptionSchema.safeParse(id);
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
  const { id } = await params;
  const updated = await db
    .update(prescriptionsTable)
    .set({
      patientId: body.patientId,
      doctorId: body.doctorId,
      appointmentId: body.appointmentId,
      medicineList: body.medicineList,
      notes: body.notes,
    })
    .where(eq(prescriptionsTable.id, parseInt(id)))
    .returning()
    .get();
  const validation = prescriptionSchema.safeParse(id);
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
  const { id } = await params;
  const ok = await db
    .delete(prescriptionsTable)
    .where(eq(prescriptionsTable.id, parseInt(id)))
    .returning()
    .get();
  const validation = prescriptionSchema.safeParse(id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
