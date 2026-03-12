const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // --- Seed __home__ user ---
  const HOME_USERNAME = "__home__";
  const existing = await prisma.user.findUnique({ where: { username: HOME_USERNAME } });

  if (existing) {
    console.log("__home__ user already exists, skipping.");
  } else {
    const hashedPassword = await hash("__home__internal__", 12);
    await prisma.$transaction(async (tx) => {
      const homeUser = await tx.user.create({
        data: {
          username: HOME_USERNAME,
          firstName: "Portfolio",
          lastName: "404",
          email: "__home__@internal.system",
          password: hashedPassword,
          emailVerified: true,
        },
      });

      await tx.siteContent.create({
        data: {
          userId: homeUser.id,
          siteTitle: "Portfolio 404",
          logoText: "Portfolio 404",
          headline: "Creative Portfolios, Instantly",
          subtext: "Build and share your professional portfolio in minutes.",
          ctaLabel1: "Explore",
          ctaLabel2: "Get Started",
          ctaTarget2: "#contact",
          contactTitle: "Get Started",
          contactSubtitle: "Create your own portfolio today",
          loadingHeading: "Portfolio 404",
          loadingSubtitle: "Loading",
          footerText: "© " + new Date().getFullYear() + " Portfolio 404",
        },
      });

      await tx.theme.create({ data: { userId: homeUser.id } });

      const featuredSection = await tx.section.create({
        data: {
          userId: homeUser.id,
          name: "Featured",
          slug: "featured",
          label: "Featured",
          subtitle: "Highlighted portfolios and projects",
          order: 0,
        },
      });

      await tx.contentItem.create({
        data: {
          userId: homeUser.id,
          sectionId: featuredSection.id,
          title: "Sample Project",
          description: "This is a sample project to get you started. Edit or replace it from the admin dashboard.",
          tags: "Portfolio,Sample",
          order: 0,
        },
      });

      // No default nav links — admin adds them manually via the dashboard
    });
    console.log("__home__ user seeded successfully.");
  }

  // --- Seed admin user ---
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@portfolio404.dev";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping.");
  } else {
    const adminHash = await hash(ADMIN_PASSWORD, 12);
    const admin = await prisma.user.create({
      data: {
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        email: ADMIN_EMAIL,
        password: adminHash,
        emailVerified: true,
      },
    });
    await prisma.siteContent.create({ data: { userId: admin.id } });
    await prisma.theme.create({ data: { userId: admin.id } });
    console.log("Admin user seeded successfully.");
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
