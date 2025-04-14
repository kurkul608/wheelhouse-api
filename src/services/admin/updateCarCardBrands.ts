import { prismaMongoClient } from "../../prisma";

export const updateCarCardBrands = async () => {
  try {
    const carCards = await prismaMongoClient.carCard.findMany({
      include: { specifications: true },
    });

    for (const car of carCards) {
      const brand = car.specifications.find((spec) => spec.field === "model");
      const vin = car.specifications.find((spec) => spec.field === "vin");
      const year = car.specifications.find((spec) => spec.field === "year");
      const model = car.specifications.find(
        (spec) => spec.field === "specification",
      );
      if (!!brand && !!model) {
        await prismaMongoClient.carCard.update({
          where: { id: car.id },
          data: {
            carBrand: brand.value,
            carModel: model.value,
          },
        });
      }
      if (!!year) {
        await prismaMongoClient.carCard.update({
          where: { id: car.id },
          data: { carYear: year.value },
        });
      }
      if (!!vin) {
        await prismaMongoClient.carCard.update({
          where: { id: car.id },
          data: { carVin: vin.value },
        });
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
