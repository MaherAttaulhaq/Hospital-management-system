import { NextResponse } from "next/server";
import db from "@/db";
import { doctors as doctorsTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { doctorSchema } from "@/lib/validation/doctorSchema";
/**
 * @openapi
 * /api/doctors/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags:
 *       - Doctors
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
 *     summary: Update a doctor
 *     tags:
 *       - Doctors
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
 *       - Doctors
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
  // validate id
  // if (isNaN(parseInt(id))) {
  //   return NextResponse.json({ error: "Invalid ID", status: 400 });
  // }
  // const validation = doctorSchema.safeParse(id);
  // if (!validation.success) {
  //   return NextResponse.json(validation.error.format(), { status: 400 });
  // }
  const doctor = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, parseInt(id)))
    .get();

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
  const validation = doctorSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const { id } = params;
  const updated = await db
    .update(doctorsTable)
    .set({
      userId: body.userId,
      specialization: body.specialization,
      fees: body.fees,
      availability: body.availability,
    })
    .where(eq(doctorsTable.id, parseInt(id)))
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

  const ok = await db
    .delete(doctorsTable)
    .where(eq(doctorsTable.id, parseInt(id)))
    .returning()
    .get();
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
