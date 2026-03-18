import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("admin123", 12);

  const existing = await prisma.user.findUnique({ where: { username: "admin" } });
  if (existing) {
    await prisma.user.update({
      where: { username: "admin" },
      data: { password, emailVerified: true, isPublished: true },
    });
    console.log("Admin user updated.");
  } else {
    await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@portfolio404.site",
        username: "admin",
        password,
        emailVerified: true,
        isPublished: true,
      },
    });
    console.log("Admin user created.");
  }

  console.log("\n  Email:    admin@portfolio404.site");
  console.log("  Password: admin123\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
