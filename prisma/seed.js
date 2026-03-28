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
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "te4c4h@gmail.com";
  // NOTE: Set ADMIN_PASSWORD in environment variables for security
  // If not set, a random password will be generated and logged
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || Math.random().toString(36).slice(-12) + "A1!";
  const existingAdmin = await prisma.user.findUnique({ where: { username: "admin" } });

  if (existingAdmin) {
    // Update existing admin with latest credentials
    const adminHash = await hash(ADMIN_PASSWORD, 12);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: ADMIN_EMAIL,
        password: adminHash,
        emailVerified: true,
      },
    });
    console.log("Admin user updated successfully.");
    if (!process.env.ADMIN_PASSWORD) {
      console.log("Generated admin password:", ADMIN_PASSWORD);
    }
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
    if (!process.env.ADMIN_PASSWORD) {
      console.log("Generated admin password:", ADMIN_PASSWORD);
    }
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
