import { Prisma, UserRole } from "@prisma/client";
import prisma from "../../prisma";

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

    await prisma.user.update({
      where: { id: userId },
      data: { roles: getNewRoles() },
    });
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });

    return updatedUser as Prisma.UserGetPayload<any>;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
