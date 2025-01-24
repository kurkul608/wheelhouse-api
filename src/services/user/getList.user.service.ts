import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getListUserService = async (): Promise<
  Prisma.UserGetPayload<any>[]
> => {
  try {
    const users = await prisma.user.findMany();

    return users;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
