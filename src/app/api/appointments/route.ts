import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { appointments as appointmentsTable } from "@/db/schemas";
/**
 * @openapi
 * /api/appointments:
 *   get:
 *     summary: List all appointments
 *     tags:
 *       - Appointments
 *     responses:
 *       '200':
 *         description: OK
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
 *     responses:
 *       '201':
 *         description: Created
 */
export async function GET() {
  const doctors = await db.select().from(appointmentsTable);
  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  const data = await req.json();
  console.log("data", data);
  const appointment = await db
    .insert(appointmentsTable)
    .values({
      date: data.date,
      patientId: data.patientId,
      doctorId: data.doctorId,
      status: data.status ?? "scheduled",
    })
    .returning()
    .get();

  console.log("appointment", appointment);

  return NextResponse.json(appointment, { status: 201 });
}
