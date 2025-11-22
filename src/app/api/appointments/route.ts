import { NextResponse } from "next/server";
import db from "@/db";
import { eq, and } from "drizzle-orm";
import {
  appointments as appointmentsTable,
  users as usersTable,
  doctors as doctorsTable,
  patients as patientsTable,
} from "@/db/schemas";
import { userAppointmentSchema } from "@/lib/validation/userAppointmentSchema";
import { alias } from "drizzle-orm/sqlite-core";
import { auth } from "../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

/**
 * @openapi
 * /api/appointments:
 *   get:
 *     summary: List all appointments
 *     tags:
 *       - Appointments
 *     responses:
 *       '200':
 *         description: A list of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   date:
 *                     type: string
 *                   patientId:
 *                     type: integer
 *                   doctorId:
 *                     type: integer
 *                   status:
 *                     type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   post:
 *     summary: Create an appointment
 *     tags:
 *       - Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               patientId:
 *                 type: integer
 *               doctorId:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Appointment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 date:
 *                   type: string
 *                 patientId:
 *                   type: integer
 *                 doctorId:
 *                   type: integer
 *                 status:
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

  let appointmentsQuery = db
    .select({
      id: appointmentsTable.id,
      date: appointmentsTable.date,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      status: appointmentsTable.status,
      patientName: patientUser.name,
      doctorName: doctorUser.name,
    })
    .from(appointmentsTable)
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorUser, eq(doctorsTable.userId, doctorUser.id))
    .leftJoin(patientUser, eq(patientsTable.userId, patientUser.id));

  // Admin can read all appointments
  if (checkPermissions(userRole, "Appointment", "read")) {
    // No additional where clause needed
  } else if (userRole === "doctor" && checkPermissions(userRole, "Appointment", "readAssigned")) {
    // Doctor can view appointments assigned to them
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).get();
    if (!doctor) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    appointmentsQuery.where(and(eq(appointmentsTable.doctorId, doctor.id)));
  } else if (userRole === "patient" && checkPermissions(userRole, "Appointment", "createOwn")) { // Using createOwn as a proxy for readOwn for now
    // Patient can view their own appointments
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (!patient) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    appointmentsQuery.where(and(eq(appointmentsTable.patientId, patient.id)));
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const appointments = await appointmentsQuery.all();
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const userId = parseInt(session.user.id);

  const data = await req.json();
  const validation = userAppointmentSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  // Admin can create any appointment
  if (checkPermissions(userRole, "Appointment", "create")) {
    const appointment = await db
      .insert(appointmentsTable)
      .values({
        date: data.date,
        patientId: data.patientId,
        doctorId: data.doctorId,
        status: data.status,
      })
      .returning()
      .get();
    return NextResponse.json(appointment, { status: 201 });
  } else if (userRole === "patient" && checkPermissions(userRole, "Appointment", "createOwn")) {
    // Patient can create their own appointments
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (!patient || patient.id !== data.patientId) {
      return NextResponse.json({ message: "Forbidden: Cannot create appointment for another patient" }, { status: 403 });
    }

    const appointment = await db
      .insert(appointmentsTable)
      .values({
        date: data.date,
        patientId: patient.id, // Ensure patientId comes from the session
        doctorId: data.doctorId,
        status: "pending", // Patients can only create pending appointments
      })
      .returning()
      .get();
    return NextResponse.json(appointment, { status: 201 });
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}
