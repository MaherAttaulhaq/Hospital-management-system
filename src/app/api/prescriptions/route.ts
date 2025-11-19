import { NextResponse } from "next/server";
import db from "@/db";
import { eq, and } from "drizzle-orm";
import {
  prescriptions as prescriptionsTable,
  users as usersTable,
  appointments as appointmentsTable,
  doctors as doctorsTable,
  patients as patientsTable,
} from "@/db/schemas";
import { prescriptionSchema } from "@/lib/validation/prescriptionSchema";
import { alias } from "drizzle-orm/sqlite-core";
import { auth } from "./../../../../../auth";
import { checkPermissions } from "@/lib/permissions";

/**
 * @openapi
 * /api/prescriptions:
 *   get:
 *     summary: List all prescriptions
 *     tags:
 *       - Prescriptions
 *     responses:
 *       '200':
 *         description: A list of prescriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   patientId:
 *                     type: integer
 *                   doctorId:
 *                     type: integer
 *                   appointmentId:
 *                     type: integer
 *                   medicineList:
 *                     type: string
 *                   notes:
 *                     type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   post:
 *     summary: Create a prescription
 *     tags:
 *       - Prescriptions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: integer
 *               doctorId:
 *                 type: integer
 *               appointmentId:
 *                 type: integer
 *               medicineList:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Prescription created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 patientId:
 *                   type: integer
 *                 doctorId:
 *                   type: integer
 *                 appointmentId:
 *                   type: integer
 *                 medicineList:
 *                   type: string
 *                 notes:
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
  const userId = parseInt(session.user.id);

  const doctorUser = alias(usersTable, "doctorUser");
  const patientUser = alias(usersTable, "patientUser");

  let prescriptionsQuery = db
    .select({
      id: prescriptionsTable.id,
      patientId: prescriptionsTable.patientId,
      doctorId: prescriptionsTable.doctorId,
      appointmentId: prescriptionsTable.appointmentId,
      medicineList: prescriptionsTable.medicineList,
      notes: prescriptionsTable.notes,
      patientName: patientUser.name,
      doctorName: doctorUser.name,
      appointmentDate: appointmentsTable.date,
    })
    .from(prescriptionsTable)
    .leftJoin(doctorsTable, eq(prescriptionsTable.doctorId, doctorsTable.id))
    .leftJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
    .leftJoin(doctorUser, eq(doctorsTable.userId, doctorUser.id))
    .leftJoin(patientUser, eq(patientsTable.userId, patientUser.id))
    .leftJoin(
      appointmentsTable,
      eq(appointmentsTable.id, prescriptionsTable.appointmentId)
    );

  // Admin can view all prescriptions
  if (checkPermissions(userRole, "Prescription", "read")) {
    // No additional where clause needed
  } else if (userRole === "doctor" && checkPermissions(userRole, "Prescription", "createForOwnPatients")) { // Using createForOwnPatients as proxy for read for own patients
    // Doctor can view prescriptions for their own patients
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).get();
    if (!doctor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    prescriptionsQuery = prescriptionsQuery.where(eq(prescriptionsTable.doctorId, doctor.id));
  } else if (userRole === "patient" && checkPermissions(userRole, "Prescription", "readOwnPrescriptions")) {
    // Patient can only view prescriptions written for them
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (!patient) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    prescriptionsQuery = prescriptionsQuery.where(eq(prescriptionsTable.patientId, patient.id));
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const prescriptions = await prescriptionsQuery.all();
  return NextResponse.json(prescriptions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const userId = parseInt(session.user.id);

  const data = await req.json();
  const validation = prescriptionSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  // Doctor can create prescriptions for their own patients
  if (userRole === "doctor" && checkPermissions(userRole, "Prescription", "createForOwnPatients")) {
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).get();
    if (!doctor || doctor.id !== data.doctorId) {
      return NextResponse.json({ message: "Forbidden: Cannot create prescription for another doctor" }, { status: 403 });
    }

    // Verify if the patient is associated with an appointment of this doctor
    const appointment = await db.select()
      .from(appointmentsTable)
      .where(and(
        eq(appointmentsTable.doctorId, doctor.id),
        eq(appointmentsTable.patientId, data.patientId)
      ))
      .get();

    if (!appointment) {
      return NextResponse.json({ message: "Forbidden: Patient not associated with this doctor's appointments" }, { status: 403 });
    }

    const prescription = await db
      .insert(prescriptionsTable)
      .values({
        patientId: data.patientId,
        doctorId: doctor.id, // Ensure doctorId comes from the session
        appointmentId: data.appointmentId,
        medicineList: data.medicineList,
        notes: data.notes,
      } as any)
      .returning()
      .get();
    return NextResponse.json(prescription, { status: 201 });
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}
