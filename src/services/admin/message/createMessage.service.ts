import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../../prisma";

export const createMessageService = async (dto: Prisma.MessageCreateInput) => {
  try {
    const message = await prismaMongoClient.message.create({
      data: dto,
    });

    return message;
  } catch (error) {
    throw error;
  }
};
