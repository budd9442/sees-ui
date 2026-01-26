import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            // Redirect logged-in users away from login page
            if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                // Add role to session
                (session.user as any).role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // Add role to token
                token.role = (user as any).role;
            }
            return token;
        }
    },
    providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;

export default authConfig;
