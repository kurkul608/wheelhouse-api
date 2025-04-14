import { Prisma, UserRole } from "@prisma/client";
import prisma from "../../prisma";
import { ONE_MONTH_CACHE_TTL, redisClient } from "../../redisClient";

export const updateRoleUserService = async (
  userId: string,
  role: UserRole,
): Promise<Prisma.UserGetPayload<any>> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User does not exist");
    }
    const isUserSuperAdmin = user.roles.some(
      (role) => role === UserRole.SUPER_ADMIN,
    );
    const getNewRoles = () => {
      if (role === UserRole.USER) {
        return isUserSuperAdmin
          ? [UserRole.USER, UserRole.SUPER_ADMIN]
          : [UserRole.USER];
      }
      if (role === UserRole.MANAGER) {
        return isUserSuperAdmin
          ? [UserRole.USER, UserRole.MANAGER, UserRole.SUPER_ADMIN]
          : [UserRole.USER, UserRole.MANAGER];
      }
      if (role === UserRole.ADMIN) {
        return isUserSuperAdmin
          ? [
              UserRole.USER,
              UserRole.MANAGER,
              UserRole.ADMIN,
              UserRole.SUPER_ADMIN,
            ]
          : [UserRole.USER, UserRole.MANAGER, UserRole.ADMIN];
      }
      return [UserRole.USER];
    };

    const cacheKey = `user:userTgId-${user.tgId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      await redisClient.del(cacheKey);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { roles: getNewRoles() },
    });
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });

    await redisClient.set(
      cacheKey,
      JSON.stringify(updatedUser),
      "EX",
      ONE_MONTH_CACHE_TTL,
    );

    return updatedUser as Prisma.UserGetPayload<any>;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
