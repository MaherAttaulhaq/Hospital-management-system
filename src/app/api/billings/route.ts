import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { billing as billingsTable } from "@/db/schemas";
import { billingSchema } from "@/lib/validation/billingSchema";
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
  const validation = billingSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  return NextResponse.json(billing, { status: 201 });
}