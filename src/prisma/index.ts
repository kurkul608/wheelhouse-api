import { PrismaClient } from "@prisma/client";

console.log(process.env.DATABASE_URL);
const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    await prisma.$disconnect();
  }
})();

export default prisma;
