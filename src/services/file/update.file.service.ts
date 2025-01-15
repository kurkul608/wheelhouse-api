import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const updateFileService = async (
  fileId: string,
  data: Prisma.FileUpdateInput,
): Promise<Prisma.FileGetPayload<any> | null> => {
  try {
    await prisma.file.update({ where: { id: fileId }, data: data });

    return prisma.file.findUnique({ where: { id: fileId } });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
