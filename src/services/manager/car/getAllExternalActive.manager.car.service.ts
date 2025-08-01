import { prismaMongoClient } from "../../../prisma";
import { WELT_CAR_ID } from "../../dataImport/weltcat";

export const getAllExternalManagerCarService = async () => {
  try {
    const cars = await prismaMongoClient.carCard.findMany({
      where: {
        externalId: {
          contains: WELT_CAR_ID,
        },
        isActive: true,
      },
    });
    return cars;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
