const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const exists = await prisma.user.findUnique({ where: { username: "testuser" } });
  if (exists) {
    console.log("testuser already exists");
    return;
  }

  const pw = await hash("test1234", 12);
  const user = await prisma.user.create({
    data: {
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      password: pw,
      emailVerified: true,
    },
  });

  await prisma.siteContent.create({
    data: {
      userId: user.id,
      siteTitle: "Test Portfolio",
      logoText: "Test",
      headline: "Hello",
      subtext: "Welcome",
      ctaLabel1: "View Work",
      ctaLabel2: "Contact Me",
      contactTitle: "Get In Touch",
      contactSubtitle: "Reach out",
      footerText: "Test User 2026",
    },
  });

  await prisma.theme.create({ data: { userId: user.id } });

  console.log("Created testuser (test@test.com / test1234)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
