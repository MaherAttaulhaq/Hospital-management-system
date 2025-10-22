import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { prescriptions as prescriptionsTable } from "@/db/schemas";

/**
 * @openapi
 * /api/prescriptions:
 *   get:
 *     summary: List all prescriptions
 *     tags:
 *       - Prescriptions
 *     responses:
 *       '200':
 *         description: OK
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
 *     responses:
 *       '201':
 *         description: Created
 */
export async function GET() {
  const doctors = await db.select().from(prescriptionsTable);
  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  const data = await req.json();
  const prescription = await db
    .insert(prescriptionsTable)
    .values({
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentId: data.appointmentId, 
      medicineList: data.medicineList, 
      notes: data.notes,
    } as any)
    .returning()
    .get();

  console.log("prescription", prescription);

  return NextResponse.json(prescription, { status: 201 });
}