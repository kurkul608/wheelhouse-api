import { prismaMongoClient } from "../../prisma";
import { CACHE_TTL, redisClient } from "../../redisClient";
import { generateCarCardListKey } from "../../utils/redisKeys/generateCarCardListKey";
import { Prisma } from "@prisma/client";

export type GetListCarCardParams = {
  limit: number;
  offset: number;
  inStock?: boolean;
  searchString?: string;
  carModelFilter?: string[];
  carBrandFilter?: string[];
  maxDateFilter?: number;
  minDateFilter?: number;
  sortOrder: string;
  sortBy: string;
};

export const getListCarCardService = async ({
  limit = 10,
  offset = 0,
  inStock,
  searchString,
  carModelFilter,
  carBrandFilter,
  maxDateFilter,
  minDateFilter,
  sortBy,
  sortOrder,
}: GetListCarCardParams): Promise<{
  items: Prisma.CarCardGetPayload<any>[];
  page: number;
  hasMore: boolean;
}> => {
  const cacheKey = generateCarCardListKey({
    limit,
    offset,
    inStock,
    searchString,
    carModelFilter,
    carBrandFilter,
    maxDateFilter,
    minDateFilter,
    sortBy,
    sortOrder,
  });

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("Cache getListCarCardService hit");
    return JSON.parse(cachedData);
  }

  const whereConditions: any = {
    isActive: true,
    ...(typeof inStock !== "undefined" && { inStock }),
  };

  const andConditions: any[] = [];

  if (
    (carBrandFilter && carBrandFilter.length) ||
    (carModelFilter && carModelFilter.length)
  ) {
    if (carBrandFilter && carBrandFilter.length) {
      andConditions.push({
        OR: carBrandFilter.map((brand: string) => ({
          OR: [
            { carBrand: { contains: brand, mode: "insensitive" } },
            { carModel: { contains: brand, mode: "insensitive" } },
          ],
        })),
      });
    }
    if (carModelFilter && carModelFilter.length) {
      andConditions.push({
        OR: carModelFilter.map((model: string) => ({
          carModel: { contains: model, mode: "insensitive" },
        })),
      });
    }
  } else if (searchString) {
    andConditions.push({
      OR: [
        { carBrand: { contains: searchString, mode: "insensitive" } },
        { carModel: { contains: searchString, mode: "insensitive" } },
      ],
    });
  }

  if (minDateFilter || maxDateFilter) {
    const yearCondition: any = {};
    if (minDateFilter) {
      yearCondition.gte = minDateFilter.toString();
    }
    if (maxDateFilter) {
      yearCondition.lte = maxDateFilter.toString();
    }
    andConditions.push({
      carYear: yearCondition,
    });
  }

  if (andConditions.length) {
    whereConditions.AND = andConditions;
  }

  const carCards = await prismaMongoClient.carCard.findMany({
    skip: offset,
    take: limit,
    include: {
      photos: {
        orderBy: {
          weight: "asc",
        },
      },
    },
    where: whereConditions,
    ...(sortOrder && sortBy
      ? {
          orderBy: {
            createdAt: sortOrder === "asc" ? "asc" : "desc",
          },
        }
      : {}),
  });

  const count = await prismaMongoClient.carCard.count({
    where: whereConditions,
    ...(sortOrder && sortBy
      ? {
          orderBy: {
            createdAt: sortOrder === "asc" ? "asc" : "desc",
          },
        }
      : {}),
  });
  const currentPage = offset / limit + 1;

  const result = {
    items: carCards,
    page: currentPage,
    hasMore: count > currentPage * limit,
  };

  await redisClient.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);

  return result;
};
