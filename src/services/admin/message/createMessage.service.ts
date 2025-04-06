import { Prisma } from "@prisma/client";
import prisma from "../../../prisma";

export const createMessageService = async (dto: Prisma.MessageCreateInput) => {
  try {
    const message = await prisma.message.create({ data: dto });

    return message;
  } catch (error) {
    throw error;
  }
};
