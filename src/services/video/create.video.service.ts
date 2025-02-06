import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const createVideoService = async (
  dto: Prisma.VideoCreateInput,
): Promise<Prisma.VideoGetPayload<any>> => {
  const video = await prisma.video.create({ data: dto });

  return video;
};
