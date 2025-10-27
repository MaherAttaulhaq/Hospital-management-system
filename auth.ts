// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import db from "@/db";
import * as schema from "@/db/schemas";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users as any,
    accountsTable: schema.accounts as any,
    sessionsTable: schema.sessions as any,
    verificationTokensTable: schema.verificationTokens as any,
  }),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const user = await db.select().from(users).where(eq(users.email, credentials.email as string)).get();

        if (user && user.password) {
          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (passwordsMatch) {
            // Return a simplified user object for the session with string id
            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
            };
          }
        }

        return null; // Return null if authentication fails
      },
    }),
  ],
  // Required for Credentials provider, which does not persist data
  session: {
    strategy: "jwt",
  },
});
