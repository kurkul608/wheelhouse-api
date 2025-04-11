import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { createMessageService } from "../../../services/admin/message/createMessage.service";
import {
  MessagePeriodType,
  MessageStatus,
  MessageType,
  Prisma,
  WhereUsersEnum,
} from "@prisma/client";
import { updateMessageService } from "../../../services/admin/message/updateMessage.service";
import { getMessageListService } from "../../../services/admin/message/getMessageList.service";
import { getMessageService } from "../../../services/admin/message/getMessage.service";

const createMessageSchema = {
  body: {
    type: "object",
    properties: {
      usersWhere: {
        type: "string",
        enum: [
          "ONCE_USE_BOT",
          "N_AUTO_IN_WISHLIST",
          "SPECIAL_AUTO_IN_WISHLIST",
          "MANY_SPECIAL_AUTO_IN_WISHLIST",
          "MANY_ORDERS",
          "MANY_ORDER_ON_BRAND",
        ],
      },
      messageTemplateId: {
        type: "string",
        pattern: "^[0-9a-fA-F]{24}$",
      },
      carCardsWhere: { type: "object" },
      name: { type: "string" },
      status: {
        type: "string",
        enum: ["ACTIVE", "DISABLED"],
      },
      type: {
        type: "string",
        enum: ["ONCE", "PERIOD"],
      },
      countAutoInWishlist: {
        type: "number",
      },
      brandsAutoInWishlist: {
        type: "array",
        items: { type: "string" },
      },
      brandsAutoInOrders: {
        type: "array",
        items: { type: "string" },
      },
      countOrders: {
        type: "number",
      },
      startTime: { type: "string", format: "date-time" },
      periodType: {
        type: "string",
        enum: ["EVERY_HOUR", "EVERY_DAY", "EVERY_WEEK", "EVERY_MONTH"],
      },
    },
    required: [
      "usersWhere",
      "messageTemplateId",
      // "carCardsWhere",
      "name",
      "status",
      "type",
      "startTime",
    ],
  },
};

const updateMessageParamsSchema = {
  type: "object",
  properties: {
    messageId: {
      type: "string",
      pattern: "^[0-9a-fA-F]{24}$", // проверка для ObjectId
    },
  },
  required: ["messageId"],
};

const updateMessageBodySchema = {
  type: "object",
  properties: {
    usersWhere: { type: "string" },
    messageTemplateId: {
      type: "string",
      pattern: "^[0-9a-fA-F]{24}$",
    },
    carCardsWhere: { type: "object" },
    name: { type: "string" },
    status: {
      type: "string",
      enum: ["ACTIVE", "DISABLED"],
    },
    countAutoInWishlist: {
      type: "number",
    },
    brandsAutoInWishlist: {
      type: "array",
      items: { type: "string" },
    },
    brandsAutoInOrders: {
      type: "array",
      items: { type: "string" },
    },
    countOrders: {
      type: "number",
    },
    type: {
      type: "string",
      enum: ["ONCE", "PERIOD"],
    },
    startTime: { type: "string", format: "date-time" },
    periodType: {
      type: "string",
      enum: ["EVERY_HOUR", "EVERY_DAY", "EVERY_WEEK", "EVERY_MONTH"],
    },
  },
  additionalProperties: false,
};

export async function adminMessageRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", adminMiddleware);

  fastify.post(
    "/admin/message",
    { schema: createMessageSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const {
          type,
          periodType,
          carCardsWhere,
          usersWhere,
          startTime,
          messageTemplateId,
          status,
          name,
          countAutoInWishlist,
          brandsAutoInWishlist,
          countOrders,
          brandsAutoInOrders,
        } = request.body as {
          usersWhere: WhereUsersEnum;
          countAutoInWishlist?: number;
          countOrders?: number;
          messageTemplateId: string;
          brandsAutoInWishlist?: string[];
          brandsAutoInOrders?: string[];
          carCardsWhere: any;
          status: MessageStatus;
          type: MessageType;
          startTime: string;
          name: string;
          periodType?: MessagePeriodType;
        };

        if (
          usersWhere === WhereUsersEnum.N_AUTO_IN_WISHLIST &&
          (countAutoInWishlist === undefined ||
            countAutoInWishlist === null ||
            countAutoInWishlist < 0)
        ) {
          return reply.status(400).send({
            message:
              "If user where is N_AUTO_IN_WISHLIST, than countAutoInWishlist should be positive number",
          });
        }

        if (
          usersWhere === WhereUsersEnum.MANY_SPECIAL_AUTO_IN_WISHLIST &&
          !brandsAutoInWishlist?.length
        ) {
          return reply.status(400).send({
            message:
              "If user where is MANY_SPECIAL_AUTO_IN_WISHLIST, than brandsAutoInWishlist should be array of brands",
          });
        }

        if (
          (usersWhere === WhereUsersEnum.MANY_ORDERS ||
            usersWhere === WhereUsersEnum.MANY_ORDER_ON_BRAND) &&
          (countOrders === undefined || countOrders === null || countOrders < 0)
        ) {
          return reply.status(400).send({
            message:
              "If user where is MANY_ORDERS or MANY_ORDER_ON_BRAND, than countOrders should be positive number",
          });
        }

        if (
          usersWhere === WhereUsersEnum.MANY_ORDER_ON_BRAND &&
          !brandsAutoInOrders?.length
        ) {
          return reply.status(400).send({
            message:
              "If user where is MANY_ORDER_ON_BRAND, than brandsAutoInOrders should be array of brands",
          });
        }

        const dto: Prisma.MessageCreateInput = {
          name,
          type,
          periodType,
          carCardsWhere,
          usersWhere,
          startTime,
          MessageTemplate: { connect: { id: messageTemplateId } },
          status,
        };

        const message = await createMessageService(dto);

        reply.status(201).send(message);
      } catch (error) {
        fastify.log.error("Error creating message ", error);
        reply.status(500).send({ error: "Unable to creating message" });
      }
    },
  );

  fastify.patch(
    "/admin/message/:messageId",
    {
      schema: {
        body: updateMessageBodySchema,
        params: updateMessageParamsSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { messageId } = request.params as { messageId: string };
        const {
          type,
          periodType,
          carCardsWhere,
          usersWhere,
          startTime,
          messageTemplateId,
          status,
          name,
          brandsAutoInWishlist,
          countAutoInWishlist,
          brandsAutoInOrders,
          countOrders,
        } = request.body as {
          usersWhere?: WhereUsersEnum;
          brandsAutoInWishlist?: string[];
          brandsAutoInOrders?: string[];
          name?: string;
          messageTemplateId?: string;
          carCardsWhere?: any;
          status?: MessageStatus;
          type?: MessageType;
          startTime?: string;
          periodType?: MessagePeriodType;
          countAutoInWishlist?: number;
          countOrders?: number;
        };

        if (
          usersWhere === WhereUsersEnum.N_AUTO_IN_WISHLIST &&
          (countAutoInWishlist === undefined ||
            countAutoInWishlist === null ||
            countAutoInWishlist < 0)
        ) {
          return reply.status(400).send({
            message:
              "If user where is N_AUTO_IN_WISHLIST, than countAutoInWishlist should be positive number",
          });
        }

        if (
          usersWhere === WhereUsersEnum.MANY_SPECIAL_AUTO_IN_WISHLIST &&
          !brandsAutoInWishlist?.length
        ) {
          return reply.status(400).send({
            message:
              "If user where is MANY_SPECIAL_AUTO_IN_WISHLIST, than brandsAutoInWishlist should be array of brands",
          });
        }

        if (
          (usersWhere === WhereUsersEnum.MANY_ORDERS ||
            usersWhere === WhereUsersEnum.MANY_ORDER_ON_BRAND) &&
          (countOrders === undefined || countOrders === null || countOrders < 0)
        ) {
          return reply.status(400).send({
            message:
              "If user where is MANY_ORDERS or MANY_ORDER_ON_BRAND, than countOrders should be positive number",
          });
        }

        if (
          usersWhere === WhereUsersEnum.MANY_ORDER_ON_BRAND &&
          !brandsAutoInOrders?.length
        ) {
          return reply.status(400).send({
            message:
              "If user where is MANY_ORDER_ON_BRAND, than brandsAutoInOrders should be array of brands",
          });
        }

        const dto: Prisma.MessageUpdateInput = {
          type,
          periodType,
          carCardsWhere,
          usersWhere,
          startTime,
          status,
          name,
          ...(messageTemplateId ? { messageTemplateId } : {}),
        };

        const message = await updateMessageService(messageId, dto);

        reply.status(200).send(message);
      } catch (error) {
        fastify.log.error("Error updating message ", error);
        reply.status(500).send({ error: "Unable to updating message" });
      }
    },
  );

  fastify.get(
    "/admin/message",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["ACTIVE", "DISABLED"] },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { status } = request.query as { status?: MessageStatus };
        const messages = await getMessageListService({ status });

        reply.status(200).send(messages);
      } catch (error) {
        fastify.log.error("Error getting message list", error);
        reply.status(500).send({ error: "Unable to getting message list" });
      }
    },
  );

  fastify.get(
    "/admin/message/:messageId",
    {
      schema: {
        params: updateMessageParamsSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { messageId } = request.params as { messageId: string };
        const message = await getMessageService(messageId);

        if (!message) {
          return reply.send(404).send({ message: "not found" });
        }

        reply.status(200).send(message);
      } catch (error) {
        fastify.log.error("Error getting message list", error);
        reply.status(500).send({ error: "Unable to getting message list" });
      }
    },
  );
}
