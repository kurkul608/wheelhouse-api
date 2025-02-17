import {
  CarBrandsFilterType,
  getCarBrandsFiltersService,
} from "./getCarBrandsFilters.service";
import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import _ from "lodash";
import { generateCarModelsFiltersKey } from "../../utils/redisKeys/generateCarModelsFiltersKey";
import { ONE_WEEK_CACHE_TTL, redisClient } from "../../redisClient/idnex";

function uniqueCaseInsensitive(arr: string[]): string[] {
  return _.uniqBy(arr, (str) => str.toLowerCase());
}

export const getCarModelFiltersService = async (
  forceClear?: boolean,
): Promise<Partial<Record<CarBrandsFilterType, string[]>>> => {
  try {
    const key = generateCarModelsFiltersKey();
    const cachedData = await redisClient.get(key);
    if (!forceClear && cachedData) {
      return JSON.parse(cachedData);
    }
    if (forceClear) {
      await redisClient.del(key);
    }

    const brands = (await getCarBrandsFiltersService()).map((opt) => opt.value);
    const modelsByBrands: Partial<Record<CarBrandsFilterType, string[]>> = {};
    for (const brand of brands) {
      const values = (
        await prisma.carCard.findMany({
          where: {
            specifications: {
              some: {
                field: "model",
                value: { contains: brand, mode: "insensitive" },
              },
            },
          },
          select: { specifications: { select: { value: true, field: true } } },
        })
      )
        .reduce(
          (acc, car) => [...acc, ...car.specifications],
          [] as Prisma.SpecificationGetPayload<{
            select: { value: true; field: true };
          }>[],
        )
        .filter((spec) => spec.field === "specification")
        .map((spec) => spec.value);
      modelsByBrands[brand] = uniqueCaseInsensitive(values);
    }

    await redisClient.set(
      key,
      JSON.stringify(modelsByBrands),
      "EX",
      ONE_WEEK_CACHE_TTL,
    );

    return modelsByBrands;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
