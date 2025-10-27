import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { appointments as appointmentsTable } from "@/db/schemas";
import { userAppointmentSchema } from "@/lib/validation/userAppointmentSchema";
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
 */
export async function GET() {
  const doctors = await db.select().from(appointmentsTable);
  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  const data = await req.json();
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
  const validation = userAppointmentSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  return NextResponse.json(appointment, { status: 201 });
}
