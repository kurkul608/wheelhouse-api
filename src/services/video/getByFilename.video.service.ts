import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const getByFilenameVideoService = async (
  filename: string,
): Promise<Prisma.VideoGetPayload<any> | null> => {
  const video = await prisma.video.findFirst({ where: { filename } });

  return video;
};
