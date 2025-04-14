import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const createVideoService = async (
  dto: Prisma.VideoCreateInput,
): Promise<Prisma.VideoGetPayload<any>> => {
  const video = await prismaMongoClient.video.create({ data: dto });

  return video;
};
