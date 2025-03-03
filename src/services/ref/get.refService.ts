import prisma from "../../prisma";
import { Ref } from "@prisma/client";

export const getRefService = async (
  refId: string,
  expanded?: boolean,
): Promise<Ref | (Ref & { usersCount: number }) | null | undefined> => {
  try {
    const ref = await prisma.ref.findUnique({ where: { id: refId } });

    if (!expanded) {
      return ref;
    }

    const usersCount = await prisma.user.count({ where: { refId } });
    const usersWithOrderCount = await prisma.user.count({
      where: {
        refId,
        client_orders: {
          some: {},
        },
      },
    });

    return { ...ref, usersCount, usersWithOrderCount } as Ref & {
      usersCount: number;
      usersWithOrderCount: number;
    };
  } catch (error) {
    console.error(error);
  }
};
