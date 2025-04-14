import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const createFileService = async (
  dto: Prisma.FileCreateInput,
): Promise<Prisma.FileGetPayload<any>> => {
  try {
    const file = await prismaMongoClient.file.create({ data: dto });

    return file;
  } catch (error) {
    console.error("Error creating file", error);
    throw error;
  }
};
