import { WhereUsersEnum, User, UserRole } from "@prisma/client";
import prisma from "../../../prisma";

export const getUsersByUserWhereService = async (
  userWhere: WhereUsersEnum,
  options?: {
    countAutoInWishlist?: number | null;
    brandsAutoInWishlist?: string[];
    brandsAutoInOrders?: string[];
    countOrders?: number | null;
  },
): Promise<User[]> => {
  try {
    switch (userWhere) {
      case WhereUsersEnum.ONCE_USE_BOT: {
        const users = await prisma.user.findMany();
        return users;
      }
      case WhereUsersEnum.N_AUTO_IN_WISHLIST: {
        const countAutoInWishlist = options?.countAutoInWishlist;
        if (countAutoInWishlist === undefined || countAutoInWishlist === null) {
          return [];
        }

        const usersWithWishlist = await prisma.user.findMany({
          include: {
            Wishlist: true,
          },
        });

        const filteredUsers = usersWithWishlist.filter((user) => {
          return (
            user?.Wishlist &&
            user?.Wishlist.carCardIds.length >= countAutoInWishlist
          );
        });

        return filteredUsers;
      }
      case WhereUsersEnum.MANY_SPECIAL_AUTO_IN_WISHLIST: {
        const brandsAutoInWishlist = options?.brandsAutoInWishlist;
        if (!brandsAutoInWishlist?.length) {
          return [];
        }

        const usersWithWishlist = await prisma.user.findMany({
          include: {
            Wishlist: {
              include: {
                carCards: true,
              },
            },
          },
        });

        const filteredUsers = usersWithWishlist.filter((user) => {
          const carCards = user.Wishlist?.carCards || [];
          return carCards.some((car) => {
            const model = car.carModel?.toLowerCase() || "";
            const brand = car.carBrand?.toLowerCase() || "";
            return brandsAutoInWishlist.some((searchTerm) => {
              const term = searchTerm.toLowerCase();
              return model.includes(term) || brand.includes(term);
            });
          });
        });

        return filteredUsers;
      }

      case WhereUsersEnum.MANY_ORDERS: {
        const countOrders = options?.countOrders;
        if (countOrders === undefined || countOrders === null) {
          return [];
        }

        const usersWithOrders = await prisma.user.findMany({
          include: {
            client_orders: true,
          },
        });

        const filteredUsers = usersWithOrders.filter(
          (user) => user.client_orders.length >= countOrders,
        );

        return filteredUsers;
      }

      case WhereUsersEnum.MANY_ORDER_ON_BRAND: {
        const brandsAutoInOrders = options?.brandsAutoInOrders;
        if (!brandsAutoInOrders?.length) {
          return [];
        }

        const usersWithOrders = await prisma.user.findMany({
          include: {
            client_orders: {
              include: {
                carCards: true,
              },
            },
          },
        });

        const filteredUsers = usersWithOrders.filter((user) => {
          return user.client_orders.some((order) => {
            return order.carCards.some((car) => {
              const model = car.carModel?.toLowerCase() || "";
              const brand = car.carBrand?.toLowerCase() || "";

              return brandsAutoInOrders.some((searchTerm) => {
                const term = searchTerm.toLowerCase();
                return model.includes(term) || brand.includes(term);
              });
            });
          });
        });

        return filteredUsers;
      }

      case WhereUsersEnum.ADMIN_ONLY: {
        const users = await prisma.user.findMany({
          where: { roles: { has: UserRole.ADMIN } },
        });
        return users;
      }
      default:
        return [];
    }
  } catch (error) {
    throw error;
  }
};
