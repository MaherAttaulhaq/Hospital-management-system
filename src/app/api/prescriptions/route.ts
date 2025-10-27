import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { prescriptions as prescriptionsTable } from "@/db/schemas";
import { prescriptionSchema } from "@/lib/validation/prescriptionSchema";

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
  const validation = prescriptionSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  return NextResponse.json(prescription, { status: 201 });
}
