const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const p = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("01Tech2024!", 12);
  await p.user.update({
    where: { username: "admin" },
    data: { password: hashedPassword },
  });
  console.log("Admin password updated to 01Tech2024!");
  await p.$disconnect();
}
main().catch((e) => { console.error(e); p.$disconnect(); });
