import prisma from "../../prisma";
import { parse as json2csv } from "json2csv";

export const getCsvAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({});

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
