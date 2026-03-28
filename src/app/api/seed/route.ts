import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { getHomeUserId } from "@/lib/home-user";

// This route seeds the database with initial data
// Should be called once after deployment
export async function POST() {
  try {
    const results = {
      homeUser: null as string | null,
      adminUser: null as string | null,
      testUser: null as string | null,
    };

    // Seed __home__ user (for landing page)
    const HOME_USERNAME = "__home__";
    const existingHome = await prisma.user.findUnique({ 
      where: { username: HOME_USERNAME } 
    });

    if (existingHome) {
      results.homeUser = "Already exists";
    } else {
      const hashedPassword = await hash("home_internal_password_2024", 12);
      await prisma.$transaction(async (tx) => {
        const homeUser = await tx.user.create({
          data: {
            username: HOME_USERNAME,
            firstName: "Portfolio",
            lastName: "404",
            email: "home@portfolio404.internal",
            password: hashedPassword,
            emailVerified: true,
            isPublished: true,
          },
        });

        await tx.siteContent.create({
          data: {
            userId: homeUser.id,
            siteTitle: "Portfolio 404 — Build Your Personal Portfolio",
            logoText: "Portfolio 404",
            headline: "Creative Portfolios, Instantly",
            subtext: "Build and share your professional portfolio in minutes. Free to start. No coding required.",
            ctaLabel1: "Explore",
            ctaLabel2: "Get Started",
            ctaTarget2: "/register",
            contactTitle: "Get Started",
            contactSubtitle: "Create your own portfolio today",
            loadingHeading: "Portfolio 404",
            loadingSubtitle: "Loading...",
            footerText: "© " + new Date().getFullYear() + " Portfolio 404",
          },
        });

        await tx.theme.create({ 
          data: { 
            userId: homeUser.id,
            accentColor: "#70E844",
            backgroundColor: "#131313",
            surfaceColor: "#181818",
            textColor: "#fafafa",
          } 
        });

        await tx.section.create({
          data: {
            userId: homeUser.id,
            name: "Featured",
            slug: "featured",
            label: "Featured Work",
            subtitle: "Highlighted portfolios and projects",
            order: 0,
          },
        });
      });
      results.homeUser = "Created successfully";
    }

    // Seed admin user
    const adminUsername = "admin";
    const adminEmail = "te4c4h@gmail.com";
    const adminPassword = "Admin@2024!Portfolio";
    
    const existingAdmin = await prisma.user.findUnique({ 
      where: { username: adminUsername } 
    });

    if (existingAdmin) {
      // Update admin with verified email and current password
      const adminHash = await hash(adminPassword, 12);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: adminEmail,
          password: adminHash,
          emailVerified: true,
          isBlocked: false,
        },
      });
      results.adminUser = "Updated successfully";
    } else {
      const adminHash = await hash(adminPassword, 12);
      await prisma.$transaction(async (tx) => {
        const admin = await tx.user.create({
          data: {
            username: adminUsername,
            firstName: "Admin",
            lastName: "User",
            email: adminEmail,
            password: adminHash,
            emailVerified: true,
            isPublished: true,
          },
        });
        await tx.siteContent.create({ data: { userId: admin.id } });
        await tx.theme.create({ data: { userId: admin.id } });
      });
      results.adminUser = "Created successfully";
    }

    // Seed test user
    const testUsername = "testuser";
    const testEmail = "test@example.com";
    const testPassword = "Test@2024!User";
    
    const existingTest = await prisma.user.findUnique({ 
      where: { username: testUsername } 
    });

    if (existingTest) {
      const testHash = await hash(testPassword, 12);
      await prisma.user.update({
        where: { id: existingTest.id },
        data: {
          email: testEmail,
          password: testHash,
          emailVerified: true,
          isBlocked: false,
        },
      });
      results.testUser = "Updated successfully";
    } else {
      const testHash = await hash(testPassword, 12);
      await prisma.$transaction(async (tx) => {
        const testUser = await tx.user.create({
          data: {
            username: testUsername,
            firstName: "Test",
            lastName: "User",
            email: testEmail,
            password: testHash,
            emailVerified: true,
            isPublished: true,
          },
        });
        
        await tx.siteContent.create({
          data: {
            userId: testUser.id,
            siteTitle: "Test User Portfolio",
            logoText: "Test",
            headline: "Hello, I'm Test User",
            subtext: "Welcome to my portfolio website",
            contactTitle: "Contact Me",
            contactSubtitle: "Get in touch",
            footerText: "© 2024 Test User",
          },
        });
        
        await tx.theme.create({ 
          data: { 
            userId: testUser.id,
            accentColor: "#70E844",
            backgroundColor: "#131313",
            surfaceColor: "#181818",
            textColor: "#fafafa",
          } 
        });

        const aboutSection = await tx.section.create({
          data: {
            userId: testUser.id,
            name: "About",
            slug: "about",
            label: "About Me",
            subtitle: "Learn more about my work",
            order: 0,
          },
        });

        const projectsSection = await tx.section.create({
          data: {
            userId: testUser.id,
            name: "Projects",
            slug: "projects",
            label: "My Projects",
            subtitle: "Check out my latest work",
            order: 1,
          },
        });

        await tx.contentItem.create({
          data: {
            userId: testUser.id,
            sectionId: projectsSection.id,
            title: "Sample Project",
            description: "This is a sample project showcasing my skills and expertise.",
            tags: "Web Development, Design",
            order: 0,
          },
        });

        await tx.contactLink.create({
          data: {
            userId: testUser.id,
            platform: "email",
            url: "mailto:test@example.com",
            order: 0,
          },
        });
      });
      results.testUser = "Created successfully";
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      results,
      credentials: {
        admin: {
          username: "admin",
          email: "te4c4h@gmail.com",
          password: "Admin@2024!Portfolio",
        },
        testUser: {
          username: "testuser",
          email: "test@example.com",
          password: "Test@2024!User",
        },
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
