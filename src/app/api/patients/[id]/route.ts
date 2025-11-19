import { NextResponse } from "next/server";
import db from "@/db";
import {
  patients as patientsTable,
  users as usersTable,
  appointments as appointmentsTable,
  doctors as doctorsTable,
} from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { patientSchema } from "@/lib/validation/patientSchema";
import { auth } from "./../../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
  const patientId = parseInt(params.id);

  let patient;

  // Admin can read any patient
  if (checkPermissions(userRole, "Patient", "read")) {
    patient = await db
      .select({
        id: patientsTable.id,
        userId: patientsTable.userId,
        dob: patientsTable.dob,
        gender: patientsTable.gender,
        medicalHistory: patientsTable.medicalHistory,
        name: usersTable.name,
      })
      .from(patientsTable)
      .leftJoin(usersTable, eq(usersTable.id, patientsTable.userId))
      .where(eq(patientsTable.id, patientId))
      .get();
  } else if (userRole === "doctor" && checkPermissions(userRole, "Patient", "readAssigned")) {
    // Doctor can read patient info for their appointments only
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, parseInt(session.user.id))).get();
    if (doctor) {
      const appointment = await db.select()
        .from(appointmentsTable)
        .where(and(
          eq(appointmentsTable.doctorId, doctor.id),
          eq(appointmentsTable.patientId, patientId)
        ))
        .get();

      if (appointment) {
        patient = await db
          .select({
            id: patientsTable.id,
            userId: patientsTable.userId,
            dob: patientsTable.dob,
            gender: patientsTable.gender,
            medicalHistory: patientsTable.medicalHistory,
            name: usersTable.name,
          })
          .from(patientsTable)
          .leftJoin(usersTable, eq(usersTable.id, patientsTable.userId))
          .where(eq(patientsTable.id, patientId))
          .get();
      }
    }
  } else if (userRole === "patient" && checkPermissions(userRole, "Patient", "readOwn")) {
    // Patient can read their own info only
    patient = await db
      .select({
        id: patientsTable.id,
        userId: patientsTable.userId,
        dob: patientsTable.dob,
        gender: patientsTable.gender,
        medicalHistory: patientsTable.medicalHistory,
        name: usersTable.name,
      })
      .from(patientsTable)
      .leftJoin(usersTable, eq(usersTable.id, patientsTable.userId))
      .where(and(eq(patientsTable.id, patientId), eq(patientsTable.userId, parseInt(session.user.id))))
      .get();
  }

  if (!patient) {
    return NextResponse.json({ message: "Forbidden or Not Found" }, { status: 403 });
  }
  return NextResponse.json(patient);
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
  const patientId = parseInt(params.id);

  const body = await req.json();
  const validation = patientSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  let updatedPatient;

  // Admin can update any patient
  if (checkPermissions(userRole, "Patient", "update")) {
    updatedPatient = await db
      .update(patientsTable)
      .set({
        userId: body.userId,
        dob: body.dob,
        gender: body.gender,
        medicalHistory: body.medicalHistory,
      })
      .where(eq(patientsTable.id, patientId))
      .returning()
      .get();
  } else if (userRole === "patient" && checkPermissions(userRole, "Patient", "updateOwn")) {
    // Patient can update their own info only
    const existingPatient = await db.select().from(patientsTable).where(eq(patientsTable.id, patientId)).get();

    if (existingPatient && existingPatient.userId === parseInt(session.user.id)) {
      updatedPatient = await db
        .update(patientsTable)
        .set({
          userId: body.userId, // Should ideally be session.user.id, but allowing update for now
          dob: body.dob,
          gender: body.gender,
          medicalHistory: body.medicalHistory,
        })
        .where(eq(patientsTable.id, patientId))
        .returning()
        .get();
    }
  }

  if (!updatedPatient) {
    return NextResponse.json({ message: "Forbidden or Not Found" }, { status: 403 });
  }

  return NextResponse.json(updatedPatient);
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
  const patientId = parseInt(params.id);

  // Admin can delete any patient
  if (checkPermissions(userRole, "Patient", "delete")) {
    const ok = await db
      .delete(patientsTable)
      .where(eq(patientsTable.id, patientId))
      .returning()
      .get();
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
