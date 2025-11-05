import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { doctors as doctorsTable } from "@/db/schemas";
import { doctorSchema } from "@/lib/validation/doctorSchema";
/**
 * @openapi
 * /api/doctors:
 *   get:
 *     summary: List all doctors
 *     tags:
 *       - Doctors
 *     responses:
 *       '200':
 *         description: List of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *   post:
 *     summary: Create a doctor
 *     tags:
 *       - Doctors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               specialization:
 *                 type: string
 *               fees:
 *                 type: integer
 *               availability:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Doctor created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       '400':
 *         description: Invalid input
 */

export async function GET() {
  const doctors = await db.select().from(doctorsTable);
  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  const data = await req.json();
  const validation = doctorSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  const doctor = await db
    .insert(doctorsTable)
    .values({
      userId: data.user_id,
      specialization: data.specialization,
      fees: data.fees,
      availability: data.availability,
    })
    .returning()
    .get();

  return NextResponse.json(doctor, { status: 201 });
}
