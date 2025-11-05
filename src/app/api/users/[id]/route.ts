import { NextResponse } from "next/server";
import db from "@/db";
import { users as usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { userSchema } from "@/lib/validation/userSchema";
/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
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
 *     summary: Update a users
 *     tags:
 *       - Users
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
 *     summary: Delete a patient
 *     tags:
 *       - user
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
  const { id } = await params;
  // validate id
  // if (isNaN(parseInt(id))) {
  //   return NextResponse.json({ error: "Invalid ID", status: 400 });
  // }
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parseInt(id)))
    .get();

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
  const { id } = params;
  const validation = userSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  const updated = await db
    .update(usersTable)
    .set({
      id: body.id,
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
    })
    .where(eq(usersTable.id, parseInt(id)))
    .returning()
    .get();

  if (!updated) return NextResponse.json({ error: "Not found", status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const ok = await db
    .delete(usersTable)
    .where(eq(usersTable.id, parseInt(params.id)))
    .returning()
    .get();
  const validation = userSchema.safeParse(params.id);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
