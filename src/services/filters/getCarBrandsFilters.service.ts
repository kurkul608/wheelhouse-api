import { generateCarBrandsFiltersKey } from "../../utils/redisKeys/generateCarBrandsFiltersKey";
import { ONE_WEEK_CACHE_TTL, redisClient } from "../../redisClient/idnex";

type FilterModelOption<T> = {
  value: T;
  label: string;
};

export const CAR_BRANDS_FILTER_OPTIONS: FilterModelOption<CarBrandsFilterType>[] =
  [
    { value: "Aston Martin", label: "Aston Martin" },
    { value: "Audi", label: "Audi" },
    { value: "Bentley", label: "Bentley" },
    { value: "BMW", label: "BMW" },
    { value: "Bugatti", label: "Bugatti" },
    { value: "Ferrari", label: "Ferrari" },
    { value: "Lamborghini", label: "Lamborghini" },
    { value: "Land Rover", label: "Land Rover" },
    { value: "Lexus", label: "Lexus" },
    { value: "Mercedes-Benz", label: "Mercedes-Benz" },
    { value: "Porsche", label: "Porsche" },
    { value: "Rolls-Royce", label: "Rolls-Royce" },
    { value: "Toyota", label: "Toyota" },
    { value: "Volkswagen", label: "Volkswagen" },
  ];

export type CarBrandsFilterType =
  | "Aston Martin"
  | "Audi"
  | "Bentley"
  | "BMW"
  | "Bugatti"
  | "Ferrari"
  | "Lamborghini"
  | "Land Rover"
  | "Lexus"
  | "Mercedes-Benz"
  | "Porsche"
  | "Rolls-Royce"
  | "Toyota"
  | "Volkswagen";

export const getCarBrandsFiltersService = async (
  forceClear?: boolean,
): Promise<FilterModelOption<CarBrandsFilterType>[]> => {
  try {
    const key = generateCarBrandsFiltersKey();
    const cachedData = await redisClient.get(key);
    if (!forceClear && cachedData) {
      return JSON.parse(cachedData);
    }

    if (forceClear) {
      await redisClient.del(key);
    }

    await redisClient.set(
      key,
      JSON.stringify(CAR_BRANDS_FILTER_OPTIONS),
      "EX",
      ONE_WEEK_CACHE_TTL,
    );

    return CAR_BRANDS_FILTER_OPTIONS;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
