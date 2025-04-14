import {
  CarBrandsFilterType,
  getCarBrandsFiltersService,
} from "./getCarBrandsFilters.service";
import prisma from "../../prisma";
import _ from "lodash";
import { generateCarModelsFiltersKey } from "../../utils/redisKeys/generateCarModelsFiltersKey";
import { ONE_WEEK_CACHE_TTL, redisClient } from "../../redisClient";

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
      const values: string[] = (
        await prisma.carCard.findMany({
          where: {
            isActive: true,
            carBrand: { contains: brand, mode: "insensitive" },
          },
        })
      )
        .filter((car) => !!car.carModel)
        .map((car) => car.carModel as string);
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
