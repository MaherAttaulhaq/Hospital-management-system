import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { patients as patientsTable, users as usersTable } from "@/db/schemas";
import { patientSchema } from "@/lib/validation/patientSchema";
import { auth } from "../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
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
  if (!checkPermissions(userRole, "Patient", "read")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const patients = await db
    .select({
      id: patientsTable.id,
      userId: patientsTable.userId,
      dob: patientsTable.dob,
      gender: patientsTable.gender,
      medicalHistory: patientsTable.medicalHistory,
      name: usersTable.name,
    })
    .from(patientsTable)
    .leftJoin(usersTable, eq(usersTable.id, patientsTable.userId));
  return NextResponse.json(patients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  if (!checkPermissions(userRole, "Patient", "create")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();
  const validation = patientSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
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

  return NextResponse.json(patient, { status: 201 });
}
