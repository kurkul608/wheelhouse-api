import { bot } from "../../../bot";
import { prismaMongoClient } from "../../../prisma";
import { InlineKeyboard, InputMediaBuilder } from "grammy";
import { File } from "@prisma/client";
import { getFileLink } from "../../../utils/getFileLink";
import {
  SendMessageTemplate,
  sendMessageTemplate,
} from "./sendMessageTemplate";

const convertToTelegramHTML = (html: string) => {
  html = html.replace(/<\/p>/g, "\n\n");
  html = html.replace(/<p[^>]*>/g, "");
  html = html.replace(/<\/?(ul|ol)[^>]*>/g, "");
  html = html.replace(/<li>(.*?)<\/li>/g, "• $1\n");
  return html.trim();
};

export const sendMessageToChanelTemplateService = async ({
  chanelId,
  ...data
}: Omit<SendMessageTemplate, "chatId"> & {
  chanelId: string | number;
}): Promise<{ message: string }> => {
  try {
    return sendMessageTemplate({ chatId: chanelId, ...data });
  } catch (error) {
    throw error;
  }
};
