const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({ where: { password: "" }, select: { id: true, email: true, username: true } });
  console.log("Found Google users:", JSON.stringify(users, null, 2));
  for (const u of users) {
    await p.theme.deleteMany({ where: { userId: u.id } });
    await p.siteContent.deleteMany({ where: { userId: u.id } });
    await p.user.delete({ where: { id: u.id } });
    console.log("Deleted:", u.email);
  }
  await p.$disconnect();
}
main().catch(e => { console.error(e); p.$disconnect(); });
