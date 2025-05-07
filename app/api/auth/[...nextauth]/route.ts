import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Export the NextAuth handler using the consolidated auth options from lib/auth.ts
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };