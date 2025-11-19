import { NextResponse } from "next/server";
import db from "@/db";
import {
  billing as billingsTable,
  users as usersTable,
  patients as patientsTable,
} from "@/db/schemas";
import { eq } from "drizzle-orm";
import { billingSchema } from "@/lib/validation/billingSchema";
import { auth } from "./../../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

/**
 * @openapi
 * /api/billings/{id}:
 *   get:
 *     summary: Get a billings by ID
 *     tags:
 *       - Billings
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not found
 *   put:
 *     summary: Update a billing by ID
 *     tags:
 *       - Billings
 *     responses:
 *       '200':
 *         description: Updated
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   delete:
 *     summary: Delete a billing
 *     tags:
 *       - Billings
 *     responses:
 *       '204':
 *         description: Deleted
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const userId = parseInt(session.user.id);
  const billingId = parseInt(params.id);

  const billing = await db
    .select({
      id: billingsTable.id,
      patientId: billingsTable.patientId,
      appointmentId: billingsTable.appointmentId,
      amount: billingsTable.amount,
      status: billingsTable.status,
      paymentMethod: billingsTable.paymentMethod,
    })
    .from(billingsTable)
    .where(eq(billingsTable.id, billingId))
    .get();

  if (!billing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Admin can read any billing
  if (checkPermissions(userRole, "Billing", "read")) {
    return NextResponse.json(billing);
  }

  // Patient can view their own bills only
  if (userRole === "patient" && checkPermissions(userRole, "Billing", "readOwn")) {
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (patient && billing.patientId === patient.id) {
      return NextResponse.json(billing);
    }
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const billingId = parseInt(params.id);

  const body = await req.json();
  const validation = billingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  // Admin can update any billing
  if (checkPermissions(userRole, "Billing", "update")) {
    const updated = await db
      .update(billingsTable)
      .set({
        patientId: body.patientId,
        appointmentId: body.appointmentId,
        amount: body.amount,
        status: body.status,
        paymentMethod: body.paymentMethod,
      })
      .where(eq(billingsTable.id, billingId))
      .returning()
      .get();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role as any;
  const billingId = parseInt(params.id);

  // Admin can delete any billing
  if (checkPermissions(userRole, "Billing", "delete")) {
    const ok = await db
      .delete(billingsTable)
      .where(eq(billingsTable.id, billingId))
      .returning()
      .get();
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
