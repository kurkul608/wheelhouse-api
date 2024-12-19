import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const createUserService = async (
  userDto: Prisma.UserCreateInput,
): Promise<Prisma.UserGetPayload<any>> => {
  const user = await prisma.user.create({ data: userDto });

  return user;
};
