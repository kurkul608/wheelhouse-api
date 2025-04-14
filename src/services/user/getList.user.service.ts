import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";

const removeAtSymbol = (input: string): string => {
  if (input.startsWith("@")) {
    return input.slice(1);
  }
  return input;
};
export const getListUserService = async (
  searchString?: string,
): Promise<Prisma.UserGetPayload<any>[]> => {
  try {
    if (!searchString) {
      return await prismaMongoClient.user.findMany();
    }

    const updatedSearchString = removeAtSymbol(searchString);

    const users = await prismaMongoClient.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: updatedSearchString,
              mode: "insensitive",
            },
          },
          {
            firstName: {
              contains: updatedSearchString,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: updatedSearchString,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return users;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
