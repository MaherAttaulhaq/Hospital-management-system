import { NextResponse } from "next/server";
import db from "@/db";
import { eq, and } from "drizzle-orm";
import {
  billing as billingsTable,
  users as usersTable,
  appointments as appointmentsTable,
  patients as patientsTable,
} from "@/db/schemas";
import { billingSchema } from "@/lib/validation/billingSchema";
import { alias } from "drizzle-orm/sqlite-core";
import { auth } from "../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

/**
 * @openapi
 * /api/billings:
 *   get:
 *     summary: List all billings
 *     tags:
 *       - Billings
 *     responses:
 *       '200':
 *         description: A list of billings
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
 *                   appointmentId:
 *                     type: integer
 *                   amount:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   paymentMethod:
 *                     type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   post:
 *     summary: Create a billing record
 *     tags:
 *       - Billings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: integer
 *               appointmentId:
 *                 type: integer
 *               amount:
 *                 type: integer
 *               status:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Billing record created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 patientId:
 *                   type: integer
 *                 appointmentId:
 *                   type: integer
 *                 amount:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 paymentMethod:
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
  const userId = parseInt(session.user.id);

  const patientUser = alias(usersTable, "patientUser");

  const billingsQuery = db
    .select({
      id: billingsTable.id,
      patientId: billingsTable.patientId,
      appointmentId: billingsTable.appointmentId,
      amount: billingsTable.amount,
      status: billingsTable.status,
      paymentMethod: billingsTable.paymentMethod,
      patientName: patientUser.name,
      appointmentDate: appointmentsTable.date,
    })
    .from(billingsTable)
    .leftJoin(patientUser, eq(billingsTable.patientId, patientUser.id))
    .leftJoin(
      appointmentsTable,
      eq(appointmentsTable.id, billingsTable.appointmentId)
    );

  // Admin can read all billings
  if (checkPermissions(userRole, "Billing", "read")) {
    // No additional where clause needed
  } else if (userRole === "patient" && checkPermissions(userRole, "Billing", "readOwn")) {
    // Patient can view their own bills only
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (!patient) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    billingsQuery.where(and(eq(billingsTable.patientId, patient.id)));
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const billings = await billingsQuery.all();
  return NextResponse.json(billings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;

  // Admin can create billing records
  if (checkPermissions(userRole, "Billing", "create")) {
    const data = await req.json();
    const validation = billingSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }
    const billing = await db
      .insert(billingsTable)
      .values({
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        amount: data.amount,
        status: data.status,
        paymentMethod: data.paymentMethod,
      })
      .returning()
      .get();
    return NextResponse.json(billing, { status: 201 });
  } else {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}
