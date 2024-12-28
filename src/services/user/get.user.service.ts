import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getUserService = async (
  userId: string,
): Promise<Prisma.UserGetPayload<any> | null> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    return user;
  } catch (error) {
    console.log("Get user error: ", error);
    throw error;
  }
};
