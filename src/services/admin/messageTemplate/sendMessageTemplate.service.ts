import { getUserService } from "../../user/get.user.service";
import { bot } from "../../../bot";
import prisma from "../../../prisma";
import { InlineKeyboard, InputFile, InputMediaBuilder } from "grammy";
import { File } from "@prisma/client";
import { getFileLink } from "../../../utils/getFileLink";
import type { InlineKeyboardButton } from "grammy/types";

const convertToTelegramHTML = (html: string) => {
  html = html.replace(/<\/p>/g, "\n\n");
  html = html.replace(/<p[^>]*>/g, "");
  html = html.replace(/<\/?(ul|ol)[^>]*>/g, "");
  html = html.replace(/<li>(.*?)<\/li>/g, "• $1\n");
  return html.trim();
};

export const sendMessageTemplateService = async ({
  messageText,
  photoIds,
  links,
  userId,
}: {
  messageText: string;
  userId: string;
  photoIds?: string[];
  links?: string[];
}): Promise<{ message: string }> => {
  try {
    const user = await getUserService(userId);

    if (!user || !user.tgId) {
      throw new Error("user not found");
    }
    let photos: File[] = [];

    if (photoIds && photoIds.length > 0) {
      photos = await prisma.file.findMany({
        where: {
          id: { in: photoIds },
        },
      });

      if (photos.length !== photoIds.length) {
        throw new Error("Один или несколько файлов не найдены");
      }
    }

    const linkPairs: [string, string][] = [];

    if (links) {
      links.forEach((link) => {
        linkPairs.push([link, link]);
      });
    }

    const buttonRows = linkPairs.map(([label, url]) => [
      InlineKeyboard.url(label, url),
    ]);

    const inlineKeyboard = InlineKeyboard.from(buttonRows);

    if (photos.length === 1) {
      await bot.api.sendPhoto(user.tgId, getFileLink(photos[0]), {
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

      await bot.api.sendMediaGroup(user.tgId, mediaGroup);

      return { message: "success" };
    }

    await bot.api.sendMessage(user.tgId, convertToTelegramHTML(messageText), {
      parse_mode: "HTML",
      ...(links?.length ? { reply_markup: inlineKeyboard } : {}),
    });

    return { message: "success" };
  } catch (error) {
    throw error;
  }
};
