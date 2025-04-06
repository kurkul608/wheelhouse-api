import { getUserService } from "../../user/get.user.service";
import { bot } from "../../../bot";

const convertToTelegramHTML = (html: string) => {
  html = html.replace(/<\/p>/g, "\n\n");
  html = html.replace(/<p[^>]*>/g, "");
  html = html.replace(/<\/?(ul|ol)[^>]*>/g, "");
  html = html.replace(/<li>(.*?)<\/li>/g, "• $1\n");
  return html.trim();
};

export const sendMessageTemplateService = async (
  messageText: string,
  userId: string,
): Promise<{ message: string }> => {
  try {
    const user = await getUserService(userId);

    if (!user || !user.tgId) {
      throw new Error("user not found");
    }

    console.log(messageText);
    console.log(convertToTelegramHTML(messageText));
    await bot.api.sendMessage(user.tgId, convertToTelegramHTML(messageText), {
      parse_mode: "HTML",
    });

    return { message: "success" };
  } catch (error) {
    throw error;
  }
};
