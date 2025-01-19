import { PrismaClient } from "@prisma/client";

console.log(process.env.DATABASE_URL);
const prisma = new PrismaClient();

export default prisma;
