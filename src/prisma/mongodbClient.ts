import { PrismaClient } from "@prisma/client";

const prismaMongoClient = new PrismaClient();

(async () => {
  try {
    await prismaMongoClient.$connect();
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    await prismaMongoClient.$disconnect();
  }
})();

export { prismaMongoClient };
