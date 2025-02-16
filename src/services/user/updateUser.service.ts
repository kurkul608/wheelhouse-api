import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { getUserService } from "./get.user.service";
import { getByTgIdUserService } from "./getByTgId.user.service";

export const updateUserService = async (
  userId: string,
  data: Prisma.UserUpdateInput,
): Promise<Prisma.UserGetPayload<any> | null> => {
  try {
    const user = await getUserService(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.update({ where: { id: user.id }, data });
    return user.tgId
      ? getByTgIdUserService(user.tgId, true)
      : getUserService(userId, true);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
