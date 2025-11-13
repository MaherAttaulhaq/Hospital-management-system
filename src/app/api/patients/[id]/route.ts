import { NextResponse } from "next/server";
import db from "@/db";
import { patients as patientsTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { patientSchema } from "@/lib/validation/patientSchema";

/**
 * @openapi
 * /api/patients/{id}:
 *   get:
 *     summary: Get a patients by ID
 *     tags:
 *       - Patients
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
 *     summary: Update a patients
 *     tags:
 *       - Patients
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
 *     summary: Delete a patient
 *     tags:
 *       - Patients
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
  const validation = patientSchema.safeParse(id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  const patients = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, parseInt(id)))
    .get();

  if (!patients) {
    return NextResponse.json({ error: "Not found", status: 404 });
  }
  return NextResponse.json(patients);
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const validation = patientSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const { id } = await params;
  const updated = await db
    .update(patientsTable)
    .set({
      userId: body.userId,
      dob: body.dob,
      gender: body.gender,
      medicalHistory: body.medicalHistory,
    })
    .where(eq(patientsTable.id, parseInt(id)))
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
    if (!id) {
    return NextResponse.json({ error: "Not found", status: 404 });
  }
  // const validation = patientSchema.safeParse(id);
  // if (!validation.success) {
  //   return NextResponse.json(validation.error.format(), { status: 400 });
  // }
  const ok = await db
    .delete(patientsTable)
    .where(eq(patientsTable.id, parseInt(params.id)))
    .returning()
    .get();

  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
