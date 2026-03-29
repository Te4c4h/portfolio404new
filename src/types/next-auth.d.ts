import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    isPaid: boolean;
    firstName: string;
    lastName: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      isAdmin: boolean;
      isPaid: boolean;
      firstName: string;
      lastName: string;
      needsSetup?: boolean;
      googleName?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    isPaid: boolean;
    firstName: string;
    lastName: string;
    needsSetup?: boolean;
    googleName?: string;
  }
}
