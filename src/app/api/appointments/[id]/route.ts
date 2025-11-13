import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { userAppointmentSchema } from "@/lib/validation/userAppointmentSchema";
import { appointments as appointmentsTable } from "@/db/schemas";
import { appointmentSchema } from "@/lib/validation/appointmentSchema";
/**
 * @openapi
 * /api/appointments/{id}:
 *   get:
 *     summary: Get a appointments by ID
 *     tags:
 *       - Appointments
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
 *               $ref: '#/components/schemas/appointments'
 *       '404':
 *         description: Not found
 *   put:
 *     summary: Update a appointments
 *     tags:
 *       - Appointments
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
 *             $ref: '#/components/schemas/appointments'
 *     responses:
 *       '200':
 *         description: Updated
 *   delete:
 *     summary: Delete a appointments
 *     tags:
 *       - Appointments
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
  const appointments = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, parseInt(id)))
    .get();
  // const validation = userAppointmentSchema.safeParse(id);
  // if (!validation.success) {
  //   return NextResponse.json(validation.error.format(), { status: 400 });
  // }
  if (!appointments) {
    return NextResponse.json({ error: "Not found", status: 404 });
  }
  return NextResponse.json(appointments);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const body = await req.json();
  const validation = userAppointmentSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  const updated = await db
    .update(appointmentsTable)
    .set({
      patientId: body.patientId,
      doctorId: body.doctorId,
      date: body.date,
      status: body.status,
    })
    .where(eq(appointmentsTable.id, parseInt(id)))
    .returning()
    .get();

  if (!updated) return NextResponse.json({ error: "Not found", status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const ok = await db
    .delete(appointmentsTable)
    .where(eq(appointmentsTable.id, parseInt(params.id)))
    .returning()
    .get();
  // const validation = userAppointmentSchema.safeParse(id);
  // if (!validation.success) {
  //   return NextResponse.json(validation.error.format(), { status: 400 });
  // }
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
