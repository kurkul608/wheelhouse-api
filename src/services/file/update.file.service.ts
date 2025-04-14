import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const updateFileService = async (
  fileId: string,
  data: Prisma.FileUpdateInput,
): Promise<Prisma.FileGetPayload<any> | null> => {
  try {
    await prismaMongoClient.file.update({ where: { id: fileId }, data: data });

    return prismaMongoClient.file.findUnique({ where: { id: fileId } });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
