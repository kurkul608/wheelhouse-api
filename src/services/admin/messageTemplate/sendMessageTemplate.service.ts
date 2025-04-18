import { getUserService } from "../../user/get.user.service";
import {
  sendMessageTemplate,
  SendMessageTemplate,
} from "./sendMessageTemplate";

export const sendMessageTemplateService = async ({
  userId,
  ...data
}: Omit<SendMessageTemplate, "chatId"> & { userId: string }) => {
  try {
    const user = await getUserService(userId);

    if (!user || !user.tgId) {
      throw new Error("user not found");
    }

    return sendMessageTemplate({ chatId: user.tgId, ...data });
  } catch (error) {
    throw error;
  }
};
