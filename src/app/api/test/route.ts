import { NextResponse } from "next/server";

/**
 * @openapi
 * /api/test:
 *   get:
 *     summary: Test endpoint
 *     tags:
 *       - Test
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Test API is working!
 */
export async function GET() {
  return NextResponse.json({ message: "Test API is working!" });
}