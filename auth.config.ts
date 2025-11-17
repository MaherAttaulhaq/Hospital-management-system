import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const paths = ["/dashboard", "/api"];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      // Excluded routes
      const excludedRoutes = [
        "/api/auth",
        "/api/register",
        "/api/swagger.json",
        "/api/test",
      ];
      if (excludedRoutes.some((path) => nextUrl.pathname.startsWith(path))) {
        return true;
      }

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/login", nextUrl.origin);
        redirectUrl.searchParams.append("callbackUrl", nextUrl.pathname);
        return Response.redirect(redirectUrl);
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
