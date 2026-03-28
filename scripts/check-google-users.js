const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user.findMany({ where: { password: "" }, select: { id: true, email: true, username: true } })
  .then(u => { console.log("Google users:", JSON.stringify(u, null, 2)); return p.$disconnect(); })
  .catch(e => { console.error(e); return p.$disconnect(); });
