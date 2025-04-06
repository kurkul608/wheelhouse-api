import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { createMessageService } from "../../../services/admin/message/createMessage.service";
import { MessagePeriodType, MessageStatus, MessageType } from "@prisma/client";
import { updateMessageTemplateService } from "../../../services/admin/messageTemplate/updateMessageTemplate.service";
import { updateMessageService } from "../../../services/admin/message/updateMessage.service";
import { getMessageListService } from "../../../services/admin/message/getMessageList.service";
import { getMessageService } from "../../../services/admin/message/getMessage.service";
const createMessageSchema = {
  body: {
    type: "object",
    properties: {
      prismaWhere: { type: "object" },
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
      startTime: { type: "string", format: "date-time" },
      periodType: {
        type: "string",
        enum: ["EVERY_HOUR", "EVERY_DAY", "EVERY_WEEK", "EVERY_MONTH"],
      },
    },
    required: [
      "prismaWhere",
      "messageTemplateId",
      "carCardsWhere",
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
    prismaWhere: { type: "object" },
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
          prismaWhere,
          startTime,
          messageTemplateId,
          status,
          name,
        } = request.body as {
          prismaWhere: any;
          messageTemplateId: string;
          carCardsWhere: any;
          status: MessageStatus;
          type: MessageType;
          startTime: string;
          name: string;
          periodType?: MessagePeriodType;
        };
        const message = await createMessageService({
          name,
          type,
          periodType,
          carCardsWhere: carCardsWhere,
          prismaWhere,
          startTime,
          MessageTemplate: { connect: { id: messageTemplateId } },
          status,
        });

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
          prismaWhere,
          startTime,
          messageTemplateId,
          status,
          name,
        } = request.body as {
          prismaWhere?: any;
          name?: string;
          messageTemplateId?: string;
          carCardsWhere?: any;
          status?: MessageStatus;
          type?: MessageType;
          startTime?: string;
          periodType?: MessagePeriodType;
        };

        const message = await updateMessageService(messageId, {
          type,
          periodType,
          carCardsWhere,
          prismaWhere,
          startTime,
          status,
          name,
          ...(messageTemplateId ? { messageTemplateId } : {}),
        });

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
