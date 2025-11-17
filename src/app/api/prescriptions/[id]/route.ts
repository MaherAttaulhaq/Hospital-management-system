import { NextResponse } from "next/server";
import db from "@/db";
import {
  prescriptions as prescriptionsTable,
  users as usersTable,
  doctors as doctorsTable,
  patients as patientsTable,
} from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { prescriptionSchema } from "@/lib/validation/prescriptionSchema";
import { auth } from "../../../../auth"; // Adjust path as needed
import { checkPermissions } from "@/lib/permissions";

/**
 * @openapi
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags:
 *       - Prescriptions
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
 *     summary: Update a prescription
 *     tags:
 *       - Prescriptions
 *     responses:
 *       '200':
 *         description: Updated
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   delete:
 *     summary: Delete a prescription
 *     tags:
 *       - Prescriptions
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
  const prescriptionId = parseInt(params.id);

  const prescription = await db
    .select()
    .from(prescriptionsTable)
    .where(eq(prescriptionsTable.id, prescriptionId))
    .get();

  if (!prescription) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Admin can read any prescription
  if (checkPermissions(userRole, "Prescription", "read")) {
    return NextResponse.json(prescription);
  }

  // Doctor can read prescriptions for their own patients
  if (userRole === "doctor" && checkPermissions(userRole, "Prescription", "createForOwnPatients")) { // Using createForOwnPatients as proxy for read for own patients
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).get();
    if (doctor && prescription.doctorId === doctor.id) {
      return NextResponse.json(prescription);
    }
  }

  // Patient can only view prescriptions written for them
  if (userRole === "patient" && checkPermissions(userRole, "Prescription", "readOwnPrescriptions")) {
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId)).get();
    if (patient && prescription.patientId === patient.id) {
      return NextResponse.json(prescription);
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
  const userId = parseInt(session.user.id);
  const prescriptionId = parseInt(params.id);

  const body = await req.json();
  const validation = prescriptionSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const existingPrescription = await db
    .select()
    .from(prescriptionsTable)
    .where(eq(prescriptionsTable.id, prescriptionId))
    .get();

  if (!existingPrescription) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Doctor can update prescriptions for their own patients
  if (userRole === "doctor" && checkPermissions(userRole, "Prescription", "updateForOwnPatients")) {
    const doctor = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId)).get();
    if (doctor && existingPrescription.doctorId === doctor.id) {
      const updated = await db
        .update(prescriptionsTable)
        .set({
          patientId: body.patientId,
          doctorId: body.doctorId,
          appointmentId: body.appointmentId,
          medicineList: body.medicineList,
          notes: body.notes,
        })
        .where(eq(prescriptionsTable.id, prescriptionId))
        .returning()
        .get();
      if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 });
      return NextResponse.json(updated);
    }
  }

  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // No role has permission to delete prescriptions.
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
