import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const getByFilenameVideoService = async (
  filename: string,
): Promise<Prisma.VideoGetPayload<any> | null> => {
  try {
    const video = await prismaMongoClient.video.findFirst({
      where: { filename },
    });

    return video;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
