import prisma from "../../prisma";

export const updateCarCardBrands = async () => {
  try {
    const carCards = await prisma.carCard.findMany({
      include: { specifications: true },
    });

    for (const car of carCards) {
      const brand = car.specifications.find((spec) => spec.field === "model");
      const year = car.specifications.find((spec) => spec.field === "year");
      const model = car.specifications.find(
        (spec) => spec.field === "specification",
      );
      if (!!brand && !!model) {
        await prisma.carCard.update({
          where: { id: car.id },
          data: {
            carBrand: brand.value,
            carModel: model.value,
          },
        });
      }
      if (!!year) {
        await prisma.carCard.update({
          where: { id: car.id },
          data: { carYear: year.value },
        });
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
