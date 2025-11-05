import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { users as usersTable } from "@/db/schemas";
import { patientSchema } from "@/lib/validation/patientSchema";
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags:
 *       - Users
 *     responses:
 *       '200':
 *         description: A list of users
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
 *     summary: Create a new user
 *     tags:
 *       - Users
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
 *         description: User created
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
  const patients = await db.select().from(usersTable);
  return NextResponse.json(patients);
}

export async function POST(req: Request) {
  const data = await req.json();

  const patient = await db
    .insert(usersTable)
    .values({
      id: data.Id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    })
    .returning()
    .get();
  const validation = patientSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  return NextResponse.json(patient, { status: 201 });
}
