import { prismaMongoClient } from "../../prisma";
import { parse as json2csv } from "json2csv";

export const getCsvUsersByRef = async (refId: string) => {
  try {
    const users = await prismaMongoClient.user.findMany({ where: { refId } });

    const csvData = users.map((user) => ({
      id: user.id,
      tgId: user.tgId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      languageCode: user.languageCode,
      createdAt: user.createdAt,
    }));

    const fields = [
      "id",
      "tgId",
      "username",
      "firstName",
      "lastName",
      "phoneNumber",
      "languageCode",
      "createdAt",
    ];

    const csv = json2csv(csvData, { fields });

    return csv;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
