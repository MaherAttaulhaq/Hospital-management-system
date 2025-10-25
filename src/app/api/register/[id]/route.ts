import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { register as registerTable } from "@/db/schemas";
import { z } from "zod";
import { userSignupSchema } from "@/lib/validation/userSignupSchema";
/**
 * @openapi
 * /api/register/{id}:
 *   get:
 *     summary: Get a register by ID
 *     tags:
 *       - Register
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       '404':
 *         description: Not found
 *   put:
 *     summary: Update a register
 *     tags:
 *       - Register
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Doctor'
 *     responses:
 *       '200':
 *         description: Updated
 *   delete:
 *     summary: Delete a register
 *     tags:
 *       - Register
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Deleted
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const user = await db
    .select()
    .from(registerTable)
    .where(eq(registerTable.id, parseInt(id)))
    .get();
  const validation = userSignupSchema.safeParse(id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!user) {
    return NextResponse.json({ error: "Not found", status: 404 });
  }
  return NextResponse.json(user);
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { id } = await params;
  const updated = await db
    .update(registerTable)
    .set({
      username: body.username,
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
    } as any)
    .where(eq(registerTable.id, parseInt(id)))
    .returning()
    .get();
  const validation = userSignupSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!updated) return NextResponse.json({ error: "Not found", status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const ok = await db
    .delete(registerTable)
    .where(eq(registerTable.id, parseInt(id)))
    .returning()
    .get();
  const validation = userSignupSchema.safeParse(id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
