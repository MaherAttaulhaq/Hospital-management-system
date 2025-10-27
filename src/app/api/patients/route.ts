import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { patients as patientsTable } from "@/db/schemas";
import { patientSchema } from "@/lib/validation/patientSchema";
/**
 * @openapi
 * /api/patients:
 *   get:
 *     summary: List all patients
 *     tags:
 *       - Patients
 *     responses:
 *       '200':
 *         description: A list of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   dob:
 *                     type: string
 *                   gender:
 *                     type: string
 *                   medicalHistory:
 *                     type: string
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
 *             properties:
 *               userId:
 *                 type: integer
 *               dob:
 *                 type: string
 *               gender:
 *                 type: string
 *               medicalHistory:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Patient created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 dob:
 *                   type: string
 *                 gender:
 *                   type: string
 *                 medicalHistory:
 *                   type: string
 *       '400':
 *         description: Invalid input
 */
export async function GET() {
  const patients = await db.select().from(patientsTable);
  return NextResponse.json(patients);
}

export async function POST(req: Request) {
  const data = await req.json();

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
  const validation = patientSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  return NextResponse.json(patient, { status: 201 });
}
