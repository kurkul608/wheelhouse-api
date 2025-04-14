import { prismaMongoClient } from "../../prisma";
import { parse as json2csv } from "json2csv";

export const getCsvUsersByRefWithOrder = async (refId: string) => {
  try {
    const users = await prismaMongoClient.user.findMany({
      where: {
        refId,
        client_orders: {
          some: {},
        },
      },
      include: {
        client_orders: {
          include: { carCards: true },
        },
      },
    });

    const data = users.map((user) => {
      const cars = user.client_orders.flatMap((order) =>
        order.carCards.map((car) => {
          const brand = car.carBrand || "";
          const model = car.carModel || "";
          return `${brand} ${model}`.trim();
        }),
      );
      const uniqueCars = [...new Set(cars)];

      return {
        id: user.id,
        tgId: user.tgId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        languageCode: user.languageCode,
        createdAt: user.createdAt,
        cars: uniqueCars.join("; "),
      };
    });

    const fields = [
      "id",
      "tgId",
      "username",
      "firstName",
      "lastName",
      "phoneNumber",
      "languageCode",
      "createdAt",
      "cars",
    ];

    const csv = json2csv(data, { fields });

    return csv;

    // const csvData = users.map((user) => ({
    //   id: user.id,
    //   tgId: user.tgId,
    //   username: user.username,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   phoneNumber: user.phoneNumber,
    //   languageCode: user.languageCode,
    //   createdAt: user.createdAt,
    // }));
    //
    // const fields = [
    //   "id",
    //   "tgId",
    //   "username",
    //   "firstName",
    //   "lastName",
    //   "phoneNumber",
    //   "languageCode",
    //   "createdAt",
    // ];
    //
    // const csv = json2csv(csvData, { fields });
    //
    // return csv;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
