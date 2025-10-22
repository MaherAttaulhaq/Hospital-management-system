import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { patients as patientsTable } from "@/db/schemas";
/**
 * @openapi
 * /api/patients:
 *   get:
 *     summary: List all patients
 *     tags:
 *       - Patients
 *     responses:
 *       '200':
 *         description: OK
 *   post:
 *     summary: Create a patient
 *     tags:
 *       - Patients
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
  const doctors = await db.select().from(patientsTable);
  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  const data = await req.json();
  console.log("data", data);
  const patient = await db
    .insert(patientsTable)
    .values({
      userId: data.userId,
      dob: data.dob,
      gender: data.gender,
      medicalHistory: data.medicalHistory,
    })
    .returning()
    .get();

  console.log("patient", patient);

  return NextResponse.json(patient, { status: 201 });
}
