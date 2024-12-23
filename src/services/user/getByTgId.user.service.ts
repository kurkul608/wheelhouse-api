import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { createBucket } from "../bucket/create.bucket.service";

export const getByTgIdUserService = async (
  userTgId: number,
): Promise<Prisma.UserGetPayload<any> | null> => {
  try {
    const user = await prisma.user.findUnique({ where: { tgId: userTgId } });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
