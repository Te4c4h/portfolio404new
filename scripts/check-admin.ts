import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: "admin" },
    select: { id: true, email: true, username: true, emailVerified: true, isBlocked: true, password: true },
  });

  if (!user) {
    console.log("No admin user found!");
    return;
  }

  console.log("Admin user found:");
  console.log("  Email:", user.email);
  console.log("  Username:", user.username);
  console.log("  emailVerified:", user.emailVerified);
  console.log("  isBlocked:", user.isBlocked);
  console.log("  Has password:", !!user.password);

  const valid = await compare("admin123", user.password);
  console.log("  Password 'admin123' valid:", valid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
