import prisma from "../../../prisma";
import { getUsersByUserWhereService } from "../users/getUsersByUserWhere.service";
import { sendMessageTemplateService } from "../messageTemplate/sendMessageTemplate.service";

export const sentMessageService = async (messageId: string) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { MessageTemplate: true },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    const users = await getUsersByUserWhereService(message.usersWhere, {
      countAutoInWishlist: message.countAutoInWishlist,
      brandsAutoInWishlist: message.brandsAutoInWishlist,
      countOrders: message.countOrders,
      brandsAutoInOrders: message.brandsAutoInOrders,
    });

    for (const user of users) {
      await sendMessageTemplateService({
        messageText: message.MessageTemplate.text,
        links: message.MessageTemplate.links as {
          label: string;
          value: string;
        }[],
        userId: user.id,
        photoIds: message.MessageTemplate.photoIds,
      });

      await new Promise((resolve) => setImmediate(resolve));
    }
  } catch (error) {
    throw error;
  }
};
