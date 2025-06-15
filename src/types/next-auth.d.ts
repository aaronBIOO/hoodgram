import { DefaultSession, DefaultUser } from "next-auth";

// NextAuth session and user types extended to include custom properties.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      supabaseUserId?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    supabaseUserId?: string;
  }
}

// Extend the NextAuth JWT type directly within its module declaration.
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    supabaseUserId?: string;
  }
}