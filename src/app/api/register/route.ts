import { NextResponse } from "next/server";
import db from "@/db";
import { eq } from "drizzle-orm";
import { register as registerTable } from "@/db/schemas";
import { z } from "zod";
import { userSignupSchema } from "@/lib/validation/userSignupSchema";
/**
 * @openapi
 * /api/register:
 *   get:
 *     summary: List all register
 *     tags:
 *       - Register
 *     responses:
 *       '200':
 *         description: OK
 *   post:
 *     summary: Create a register
 *     tags:
 *       - Register
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
export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.insert(registerTable).values({
    username: body.username,
    email: body.email,
    password: body.password,
    confirmPassword: body.confirmPassword
  }).returning().get();

  const validation = userSignupSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }
  return NextResponse.json(body);
}
export async function GET() {
  const user = await db.select().from(registerTable).all();
  return NextResponse.json(user);
}
