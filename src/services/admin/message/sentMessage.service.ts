import { prismaMongoClient } from "../../../prisma";
import { getUsersByUserWhereService } from "../users/getUsersByUserWhere.service";
import { sendMessageTemplateService } from "../messageTemplate/sendMessageTemplate.service";
import { createLog } from "../../logs/createLog.service";
import { MessageStatus } from "@prisma/client";

export const sentMessageService = async (messageId: string) => {
  try {
    const message = await prismaMongoClient.message.findUnique({
      where: { id: messageId, status: MessageStatus.ACTIVE },
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
        ...(message.MessageTemplate.carsWhereStock
          ? { carsWhereStock: message.MessageTemplate.carsWhereStock }
          : {}),
        ...(message.MessageTemplate.carsWhere
          ? { carsWhere: message.MessageTemplate.carsWhere }
          : {}),
        ...(message.MessageTemplate.carsWhereDefaultPeriod
          ? {
              carsWhereDefaultPeriod:
                message.MessageTemplate.carsWhereDefaultPeriod,
            }
          : {}),
        ...(message.MessageTemplate.carsWherePeriodStart
          ? {
              carsWherePeriodStart: String(
                message.MessageTemplate.carsWherePeriodStart,
              ),
            }
          : {}),
        ...(message.MessageTemplate.carsWherePeriodEnd
          ? {
              carsWherePeriodEnd: String(
                message.MessageTemplate.carsWherePeriodEnd,
              ),
            }
          : {}),
      })
        .then(async () => {
          await createLog(messageId, user.id, "success");
        })
        .catch(async () => {
          await createLog(messageId, user.id, "fail");
        });

      await new Promise((resolve) => setImmediate(resolve));
    }
  } catch (error) {
    throw error;
  }
};
