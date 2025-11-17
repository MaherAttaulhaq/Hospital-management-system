import { NextResponse } from "next/server";
import db from "@/db";
import { doctors as doctorsTable, users as usersTable } from "@/db/schemas";
import { eq, sql } from "drizzle-orm";
import { doctorSchema } from "@/lib/validation/doctorSchema";
import { auth } from "../../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const doctorId = parseInt(params.id);

  // Admin can read any doctor
  if (checkPermissions(userRole, "Doctor", "read")) {
    const doctor = await db
      .select({
        id: doctorsTable.id,
        userId: doctorsTable.userId,
        specialization: doctorsTable.specialization,
        fees: doctorsTable.fees,
        availability: doctorsTable.availability,
        name: usersTable.name,
      })
      .from(doctorsTable)
      .leftJoin(usersTable, eq(usersTable.id, doctorsTable.userId))
      .where(eq(doctorsTable.id, doctorId))
      .get();

    if (!doctor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(doctor);
  }

  // Doctor can read their own profile
  if (
    userRole === "doctor" &&
    checkPermissions(userRole, "Doctor", "readOwn") &&
    parseInt(session.user.id) === doctorId
  ) {
    const doctor = await db
      .select({
        id: doctorsTable.id,
        userId: doctorsTable.userId,
        specialization: doctorsTable.specialization,
        fees: doctorsTable.fees,
        availability: doctorsTable.availability,
        name: usersTable.name,
      })
      .from(doctorsTable)
      .leftJoin(usersTable, eq(usersTable.id, doctorsTable.userId))
      .where(eq(doctorsTable.id, doctorId))
      .get();

    if (!doctor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(doctor);
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
  const doctorId = parseInt(params.id);

  // Admin can update any doctor
  if (checkPermissions(userRole, "Doctor", "update")) {
    const body = await req.json();
    const validation = doctorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const updated = await db
      .update(doctorsTable)
      .set({
        userId: body.userId,
        specialization: body.specialization,
        fees: body.fees,
        availability: body.availability,
      })
      .where(eq(doctorsTable.id, doctorId))
      .returning()
      .get();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  }

  // Doctor can update their own profile
  if (
    userRole === "doctor" &&
    checkPermissions(userRole, "Doctor", "updateOwn") &&
    parseInt(session.user.id) === doctorId
  ) {
    const body = await req.json();
    const validation = doctorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const updated = await db
      .update(doctorsTable)
      .set({
        userId: body.userId,
        specialization: body.specialization,
        fees: body.fees,
        availability: body.availability,
      })
      .where(eq(doctorsTable.id, doctorId))
      .returning()
      .get();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
  const doctorId = parseInt(params.id);

  // Admin can delete any doctor
  if (checkPermissions(userRole, "Doctor", "delete")) {
    const ok = await db
      .delete(doctorsTable)
      .where(eq(doctorsTable.id, doctorId))
      .returning()
      .get();
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
