import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isActive?: boolean;
      isExpired?: boolean;
    };
    authTime?: number;
  }

  interface User extends DefaultUser {
    role?: string;
    isActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: string
    isActive: boolean
    authTime?: number
    isExpired?: boolean
  }
} 