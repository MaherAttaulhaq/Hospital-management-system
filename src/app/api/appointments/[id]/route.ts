import { NextResponse } from "next/server";
import db from "@/db";
import { eq, and } from "drizzle-orm";
import {
  appointments as appointmentsTable,
  doctors as doctorsTable,
  patients as patientsTable,
} from "@/db/schemas";
import { userAppointmentSchema } from "@/lib/validation/userAppointmentSchema";
import { auth } from "./../../../../../auth";
import { checkPermissions } from "@/lib/permissions";

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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
  const userId = parseInt(session.user.id);
  const appointmentId = parseInt(params.id);

  const appointment = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, appointmentId))
    .get();

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Admin can read any appointment
  if (checkPermissions(userRole, "Appointment", "read")) {
    return NextResponse.json(appointment);
  }

  // Doctor can read appointments assigned to them
  if (userRole === "doctor" && checkPermissions(userRole, "Appointment", "readAssigned")) {
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).get();
    if (doctor && appointment.doctorId === doctor.id) {
      return NextResponse.json(appointment);
    }
  }

  // Patient can read their own appointments
  if (userRole === "patient" && checkPermissions(userRole, "Appointment", "createOwn")) { // Using createOwn as proxy for readOwn
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (patient && appointment.patientId === patient.id) {
      return NextResponse.json(appointment);
    }
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
  const userId = parseInt(session.user.id);
  const appointmentId = parseInt(params.id);

  const body = await req.json();
  const validation = userAppointmentSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const existingAppointment = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, appointmentId))
    .get();

  if (!existingAppointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let updatedData: Partial<typeof appointmentsTable.$inferInsert> = {};
  let canUpdate = false;

  // Admin can update any appointment
  if (checkPermissions(userRole, "Appointment", "update")) {
    updatedData = {
      patientId: body.patientId,
      doctorId: body.doctorId,
      date: body.date,
      status: body.status,
    };
    canUpdate = true;
  } else if (userRole === "doctor" && checkPermissions(userRole, "Appointment", "updateStatus")) {
    // Doctor can update status of assigned appointments
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).get();
    if (doctor && existingAppointment.doctorId === doctor.id) {
      if (body.status) {
        updatedData.status = body.status;
        canUpdate = true;
      } else {
        return NextResponse.json({ message: "Doctors can only update appointment status" }, { status: 400 });
      }
    }
  } else if (userRole === "patient" && checkPermissions(userRole, "Appointment", "cancelOwn")) {
    // Patient can cancel their own appointments
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (patient && existingAppointment.patientId === patient.id) {
      if (body.status === "canceled") {
        updatedData.status = "canceled";
        canUpdate = true;
      } else {
        return NextResponse.json({ message: "Patients can only cancel their own appointments" }, { status: 400 });
      }
    }
  }

  if (!canUpdate) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const updated = await db
    .update(appointmentsTable)
    .set(updatedData)
    .where(eq(appointmentsTable.id, appointmentId))
    .returning()
    .get();

  if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  return NextResponse.json(updated);
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
  const appointmentId = parseInt(params.id);

  // Admin can delete any appointment
  if (checkPermissions(userRole, "Appointment", "delete")) {
    const ok = await db
      .delete(appointmentsTable)
      .where(eq(appointmentsTable.id, appointmentId))
      .returning()
      .get();
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
