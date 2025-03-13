import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { getIdByToken } from "../../utils/auth";
import { getByTgIdUserService } from "../../services/user/getByTgId.user.service";
import { createOrder } from "../../services/order/create.order";
import { sendOrderMessageBotService } from "../../services/bot/sendOrderMessage.bot.service";
import { addMessageOrderService } from "../../services/order/addMessage.order.service";
import { updateUserService } from "../../services/user/updateUser.service";
import { getUserService } from "../../services/user/get.user.service";
import { sendEventToYandexMetrika } from "../../services/sendMetrika/sendMetrika.service";
import { getCarCardService } from "../../services/carCard/get.carCard.service";

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post(
    "/orders",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            carId: { type: "string" },
            isInquiresAboutPrice: { type: "boolean" },
            contact: {
              type: "object",
              properties: {
                userId: { type: "number" },
                phoneNumber: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
              },
              required: ["userId", "phoneNumber", "firstName"],
            },
          },
          required: ["carId", "contact"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userTgId = getIdByToken(request.headers.authorization || "");
      const existUser = await getByTgIdUserService(userTgId);
      const { carId, isInquiresAboutPrice, contact } = request.body as {
        carId: string;
        isInquiresAboutPrice: boolean;
        contact: {
          userId: number;
          phoneNumber: string;
          firstName: string;
          lastName?: string;
        };
      };

      if (!existUser) {
        return reply.status(404).send("user not found");
      }

      const order = await createOrder(carId, existUser.id);
      const user = await getByTgIdUserService(contact.userId);
      if (user && !user.phoneNumber) {
        await updateUserService(user.id, {
          phoneNumber: contact.phoneNumber,
          firstName: contact.firstName,
          lastName: contact.lastName,
        });
      }

      const message = await sendOrderMessageBotService(
        order.id,
        isInquiresAboutPrice,
      );
      await addMessageOrderService(order.id, String(message.message_id));

      getCarCardService(carId).then((carCard) => {
        if (carCard && user && user.clientId) {
          sendEventToYandexMetrika({
            eventType: "event",
            pageURL: `${process.env.MINI_APP_URL}/order/create/${carCard.id}`,
            transaction: "create-order",
            target: carCard.id,
            price: carCard.price || "",
            coupon: "",
            currency: (carCard.currency as string) || "",
            clientID: user.clientId,
          });
        }
      });

      return reply.status(201).send(order);
    },
  );
}
