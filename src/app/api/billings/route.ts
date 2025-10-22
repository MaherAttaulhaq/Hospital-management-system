import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { billing as billingsTable } from "@/db/schemas";
/**
 * @openapi
 * /api/billings:
 *   get:
 *     summary: List all billings
 *     tags:
 *       - Billings
 *     responses:
 *       '200':
 *         description: OK
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
 *     responses:
 *       '201':
 *         description: Created
 */
export async function GET() {
  const billings = await db.select().from(billingsTable);
  return NextResponse.json(billings);
}

export async function POST(req: Request) {
  const data = await req.json();
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

  console.log("billing", billing);

  return NextResponse.json(billing, { status: 201 });
}