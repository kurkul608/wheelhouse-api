import {
  CarCard,
  CarsWhereEnum,
  CarsWherePeriodEnum,
  CarsWhereStockEnum,
  File,
  Prisma,
} from "@prisma/client";
import { DateTime } from "luxon";
import { prismaMongoClient } from "../../../prisma";
import { InlineKeyboardButton } from "grammy/types";
import { InlineKeyboard, InputMediaBuilder } from "grammy";
import { getMiniAppLink } from "../../../utils/getMiniAppLink";
import { bot } from "../../../bot";
import { getFileLink } from "../../../utils/getFileLink";

export interface SendMessageTemplate {
  messageText: string;
  chatId: string | number;
  photoIds?: string[];
  links?: { label: string; value: string }[];
  carsWhere?: CarsWhereEnum;
  carsWhereDefaultPeriod?: CarsWherePeriodEnum;
  carsWhereStock?: CarsWhereStockEnum;
  carsWhereByUserIds?: string[];
  carsWherePeriodStart?: string;
  carsWherePeriodEnd?: string;
}

const convertToTelegramHTML = (html: string) => {
  html = html.replace(/<\/p>/g, "\n\n");
  html = html.replace(/<p[^>]*>/g, "");
  html = html.replace(/<\/?(ul|ol)[^>]*>/g, "");
  html = html.replace(/<li>(.*?)<\/li>/g, "• $1\n");
  return html.trim();
};

const getCarsByDefaultPeriod = (period: CarsWherePeriodEnum) => {
  const now = DateTime.now();

  switch (period) {
    case CarsWherePeriodEnum.LAST_DAY:
      return {
        gte: now.minus({ days: 1 }).toJSDate(),
        lte: now.toJSDate(),
      };
    case CarsWherePeriodEnum.LAST_WEEK:
      return {
        gte: now.minus({ weeks: 1 }).toJSDate(),
        lte: now.toJSDate(),
      };
    case CarsWherePeriodEnum.LAST_MONTH:
      return {
        gte: now.minus({ months: 1 }).toJSDate(),
        lte: now.toJSDate(),
      };
    default:
      return null;
  }
};

const findCars = async ({
  carsWhere,
  carsWhereStock,
  carsWhereDefaultPeriod,
  carsWherePeriodStart,
  carsWherePeriodEnd,
  carsWhereByUserIds,
}: Pick<
  SendMessageTemplate,
  | "carsWhereDefaultPeriod"
  | "carsWhere"
  | "carsWhereStock"
  | "carsWhereByUserIds"
> & {
  carsWherePeriodStart?: DateTime;
  carsWherePeriodEnd?: DateTime;
}): Promise<CarCard[]> => {
  const baseQuery: { where: Prisma.CarCardWhereInput } = {
    where: {
      AND: [] as Prisma.CarCardWhereInput[],
    },
  };

  if (!carsWhere) {
    return [];
  }

  switch (carsWhere) {
    case CarsWhereEnum.SELECT_BY_USER:
      if (carsWhereByUserIds && carsWhereByUserIds.length > 0) {
        (baseQuery.where.AND as Prisma.CarCardWhereInput[])?.push({
          id: {
            in: carsWhereByUserIds,
          },
        });
      }
      break;

    case CarsWhereEnum.SELECT_BY_USER_PERIOD:
      if (carsWherePeriodStart && carsWherePeriodEnd) {
        (baseQuery.where.AND as Prisma.CarCardWhereInput[])?.push({
          createdAt: {
            gte: carsWherePeriodStart.toJSDate(),
            lte: carsWherePeriodEnd.toJSDate(),
          },
        });
      }
      break;

    case CarsWhereEnum.SELECT_BY_DEFAULT_PERIOD:
      if (carsWhereDefaultPeriod) {
        const periodDates = getCarsByDefaultPeriod(carsWhereDefaultPeriod);
        if (periodDates) {
          (baseQuery.where.AND as Prisma.CarCardWhereInput[])?.push({
            createdAt: periodDates,
          });
        }
      }
      break;
  }

  if (carsWhereStock) {
    (baseQuery.where.AND as Prisma.CarCardWhereInput[])?.push({
      inStock: carsWhereStock === "IN_STOCK",
    });
  }

  (baseQuery.where.AND as Prisma.CarCardWhereInput[])?.push({
    isActive: true,
  });

  return prismaMongoClient.carCard.findMany(baseQuery);
};

const getCarsInlineButtons = (
  cars: CarCard[],
): InlineKeyboardButton.UrlButton[][] => {
  const carsInlineButtons = cars.map((car) => {
    const model = car.carModel || "Автомобиль";
    return [InlineKeyboard.url(model, getMiniAppLink({ carId: car.id }))];
  });

  return carsInlineButtons;
};

export const sendMessageTemplate = async ({
  messageText,
  photoIds,
  carsWhereByUserIds,
  carsWhereStock,
  carsWhereDefaultPeriod,
  carsWherePeriodStart,
  carsWherePeriodEnd,
  carsWhere,
  links,
  chatId,
}: SendMessageTemplate): Promise<{
  message: string;
}> => {
  try {
    let carsInlineButtons: InlineKeyboardButton.UrlButton[][] = [];

    if (carsWhere) {
      const cars = await findCars({
        carsWhere,
        carsWhereStock,
        carsWhereDefaultPeriod,
        carsWherePeriodStart: carsWherePeriodStart
          ? DateTime.fromISO(carsWherePeriodStart)
          : undefined,
        carsWherePeriodEnd: carsWherePeriodEnd
          ? DateTime.fromISO(carsWherePeriodEnd)
          : undefined,
        carsWhereByUserIds,
      });

      if (!cars.length) {
        return { message: "No cars" };
      }
      carsInlineButtons = getCarsInlineButtons(cars);
    }

    let photos: File[] = [];

    if (photoIds && photoIds.length > 0) {
      photos = await prismaMongoClient.file.findMany({
        where: {
          id: { in: photoIds },
        },
        orderBy: { weight: "asc" },
      });

      if (photos.length !== photoIds.length) {
        throw new Error("Один или несколько файлов не найдены");
      }
    }

    const linkPairs: [string, string][] = [];

    if (links) {
      links.forEach((link) => {
        linkPairs.push([link.label, link.value]);
      });
    }

    const buttonRows = linkPairs.map(([label, url]) => [
      InlineKeyboard.url(label, url),
    ]);

    const inlineKeyboard = InlineKeyboard.from([
      ...buttonRows,
      ...carsInlineButtons,
    ]);

    if (photos.length === 1) {
      await bot.api.sendPhoto(chatId, getFileLink(photos[0]), {
        caption: convertToTelegramHTML(messageText),
        parse_mode: "HTML",
        ...(inlineKeyboard?.inline_keyboard?.length
          ? { reply_markup: inlineKeyboard }
          : {}),
      });
      return { message: "success" };
    }

    if (photos.length > 1) {
      const mediaGroup = photos.map((photo, index) =>
        InputMediaBuilder.photo(
          getFileLink(photo),
          index === 0
            ? {
                caption: convertToTelegramHTML(messageText),
                parse_mode: "HTML",
              }
            : undefined,
        ),
      );

      await bot.api.sendMediaGroup(chatId, mediaGroup);

      return { message: "success" };
    }

    await bot.api.sendMessage(chatId, convertToTelegramHTML(messageText), {
      parse_mode: "HTML",
      ...(inlineKeyboard?.inline_keyboard?.length
        ? { reply_markup: inlineKeyboard }
        : {}),
    });

    return { message: "success" };
  } catch (error) {
    console.log((error as { message: string }).message);
    throw error;
  }
};
