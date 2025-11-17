import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { doctors as doctorsTable, users as usersTable } from "@/db/schemas";
import { doctorSchema } from "@/lib/validation/doctorSchema";
import { auth } from "../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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

  const userRole = session.user.role as any; // Assuming role is always present and valid
  if (!checkPermissions(userRole, "Doctor", "read")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const doctors = await db
    .select({
      id: doctorsTable.id,
      userId: doctorsTable.userId,
      specialization: doctorsTable.specialization,
      fees: doctorsTable.fees,
      availability: doctorsTable.availability,
      name: usersTable.name,
    })
    .from(doctorsTable)
    .leftJoin(usersTable, eq(usersTable.id, doctorsTable.userId));
  return NextResponse.json(doctors);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any; // Assuming role is always present and valid
  if (!checkPermissions(userRole, "Doctor", "create")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();
  const validation = doctorSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  const doctor = await db
    .insert(doctorsTable)
    .values({
      userId: data.userId,
      specialization: data.specialization,
      fees: data.fees,
      availability: data.availability,
    })
    .returning()
    .get();

  return NextResponse.json(doctor, { status: 201 });
}
