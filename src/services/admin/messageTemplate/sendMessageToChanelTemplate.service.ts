import { bot } from "../../../bot";
import { prismaMongoClient } from "../../../prisma";
import { InlineKeyboard, InputMediaBuilder } from "grammy";
import { File } from "@prisma/client";
import { getFileLink } from "../../../utils/getFileLink";

const convertToTelegramHTML = (html: string) => {
  html = html.replace(/<\/p>/g, "\n\n");
  html = html.replace(/<p[^>]*>/g, "");
  html = html.replace(/<\/?(ul|ol)[^>]*>/g, "");
  html = html.replace(/<li>(.*?)<\/li>/g, "• $1\n");
  return html.trim();
};

export const sendMessageToChanelTemplateService = async ({
  messageText,
  photoIds,
  links,
  chanelId,
}: {
  messageText: string;
  chanelId: string | number;
  photoIds?: string[];
  links?: { label: string; value: string }[];
}): Promise<{ message: string }> => {
  try {
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

    const inlineKeyboard = InlineKeyboard.from(buttonRows);

    if (photos.length === 1) {
      await bot.api.sendPhoto(chanelId, getFileLink(photos[0]), {
        caption: convertToTelegramHTML(messageText),
        parse_mode: "HTML",
        ...(links?.length ? { reply_markup: inlineKeyboard } : {}),
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
                // ...(links?.length ? { reply_markup: inlineKeyboard } : {}),
              }
            : undefined,
        ),
      );

      console.log(mediaGroup);

      await bot.api.sendMediaGroup(chanelId, mediaGroup);

      return { message: "success" };
    }

    console.log("Before sendMessage");
    await bot.api
      .sendMessage(chanelId, convertToTelegramHTML(messageText), {
        parse_mode: "HTML",
        ...(links?.length ? { reply_markup: inlineKeyboard } : {}),
      })
      .catch((error) => {
        console.log("error, ", error.message);
      });

    return { message: "success" };
  } catch (error) {
    throw error;
  }
};
