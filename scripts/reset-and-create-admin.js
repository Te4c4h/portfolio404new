const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const p = new PrismaClient();

async function main() {
  // Delete all related data first, then all users
  const allUsers = await p.user.findMany({ select: { id: true, email: true, username: true } });
  console.log("Existing users:", JSON.stringify(allUsers, null, 2));

  for (const u of allUsers) {
    await p.theme.deleteMany({ where: { userId: u.id } });
    await p.siteContent.deleteMany({ where: { userId: u.id } });
    await p.section.deleteMany({ where: { userId: u.id } });
    await p.navLink.deleteMany({ where: { userId: u.id } });
    await p.contactLink.deleteMany({ where: { userId: u.id } });
    await p.contentItem.deleteMany({ where: { userId: u.id } });
    await p.user.delete({ where: { id: u.id } });
    console.log("Deleted user:", u.email);
  }

  // Create admin account
  const hashedPassword = await bcrypt.hash("01Tech2024!", 12);
  const admin = await p.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        firstName: "Admin",
        lastName: "Portfolio404",
        email: "te4c4h@gmail.com",
        username: "admin",
        password: hashedPassword,
        emailVerified: true,
        isPublished: true,
      },
    });

    await tx.siteContent.create({
      data: {
        userId: newUser.id,
        siteTitle: "Portfolio 404",
        logoText: "Admin",
        headline: "Hello, I'm Admin",
        subtext: "Welcome to my portfolio",
        ctaLabel1: "View Work",
        ctaLabel2: "Contact Me",
        contactTitle: "Get In Touch",
        contactSubtitle: "Feel free to reach out",
        footerText: "© 2026 Portfolio 404",
      },
    });

    await tx.theme.create({
      data: { userId: newUser.id },
    });

    return newUser;
  });

  console.log("Admin created:", { id: admin.id, email: admin.email, username: admin.username });
  await p.$disconnect();
}

main().catch((e) => { console.error(e); p.$disconnect(); });
