import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { createMessageTemplateService } from "../../../services/admin/messageTemplate/createMessageTemplate.service";
import { getMessageTemplateListService } from "../../../services/admin/messageTemplate/getMessageTemplateList.service";
import { getMessageTemplateService } from "../../../services/admin/messageTemplate/getMessageTemplate.service";
import { sendMessageTemplateService } from "../../../services/admin/messageTemplate/sendMessageTemplate.service";
import { updateMessageTemplateService } from "../../../services/admin/messageTemplate/updateMessageTemplate.service";
import { sendMessageToChanelTemplateService } from "../../../services/admin/messageTemplate/sendMessageToChanelTemplate.service";
import {
  CarsWhereEnum,
  CarsWherePeriodEnum,
  CarsWhereStockEnum,
} from "@prisma/client";

export async function adminTemplateRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", adminMiddleware);
  fastify.post(
    "/admin/messageTemplate/sent-to-chanel",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            text: { type: "string" },
            chanelId: { type: "string" },
            photoIds: {
              type: "array",
              items: { type: "string" },
            },
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string" },
                },
                required: ["label", "value"],
              },
            },
            carsWhere: {
              type: "string",
              enum: [
                "SELECT_BY_USER",
                "SELECT_BY_USER_PERIOD",
                "SELECT_BY_DEFAULT_PERIOD",
              ],
            },
            carsWhereDefaultPeriod: {
              type: "string",
              enum: ["LAST_DAY", "LAST_WEEK", "LAST_MONTH"],
            },
            carsWhereStock: {
              type: "string",
              enum: ["IN_STOCK", "IN_ORDER"],
            },
            carsWhereByUserIds: {
              type: "array",
              items: { type: "string" },
            },
            carsWherePeriodStart: {
              type: "string",
              format: "date-time",
            },
            carsWherePeriodEnd: {
              type: "string",
              format: "date-time",
            },
          },

          required: ["text", "chanelId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const {
          text,
          chanelId,
          photoIds,
          links,
          carsWhereDefaultPeriod,
          carsWhereStock,
          carsWhere,
          carsWherePeriodStart,
          carsWherePeriodEnd,
          carsWhereByUserIds,
        } = request.body as {
          text: string;
          chanelId: string;
          photoIds?: string[];
          links?: { label: string; value: string }[];
          carsWhere?: CarsWhereEnum;
          carsWhereDefaultPeriod?: CarsWherePeriodEnum;
          carsWhereStock?: CarsWhereStockEnum;
          carsWhereByUserIds?: string[];
          carsWherePeriodStart?: string;
          carsWherePeriodEnd?: string;
        };

        const result = await sendMessageToChanelTemplateService({
          chanelId,
          links,
          messageText: text,
          photoIds,
          carsWhereDefaultPeriod,
          carsWhereStock,
          carsWhere,
          carsWherePeriodStart,
          carsWherePeriodEnd,
          carsWhereByUserIds,
        });

        reply.status(200).send(result);
      } catch (error) {
        fastify.log.error("Error sending messageTemplate ", error);
        reply.status(500).send({ error: "Unable to sending messageTemplate" });
      }
    },
  );
  fastify.post(
    "/admin/messageTemplate/sent",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            text: { type: "string" },
            userId: { type: "string" },
            photoIds: {
              type: "array",
              items: { type: "string" },
            },
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string" },
                },
                required: ["label", "value"],
              },
            },
            carsWhere: {
              type: "string",
              enum: [
                "SELECT_BY_USER",
                "SELECT_BY_USER_PERIOD",
                "SELECT_BY_DEFAULT_PERIOD",
              ],
            },
            carsWhereDefaultPeriod: {
              type: "string",
              enum: ["LAST_DAY", "LAST_WEEK", "LAST_MONTH"],
            },
            carsWhereStock: {
              type: "string",
              enum: ["IN_STOCK", "IN_ORDER"],
            },
            carsWhereByUserIds: {
              type: "array",
              items: { type: "string" },
            },
            carsWherePeriodStart: {
              type: "string",
              format: "date-time",
            },
            carsWherePeriodEnd: {
              type: "string",
              format: "date-time",
            },
          },
          required: ["text", "userId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const {
          text,
          userId,
          photoIds,
          links,
          carsWhereDefaultPeriod,
          carsWhereStock,
          carsWhere,
          carsWherePeriodStart,
          carsWherePeriodEnd,
          carsWhereByUserIds,
        } = request.body as {
          text: string;
          userId: string;
          photoIds?: string[];
          links?: { label: string; value: string }[];
          carsWhere?: CarsWhereEnum;
          carsWhereDefaultPeriod?: CarsWherePeriodEnum;
          carsWhereStock?: CarsWhereStockEnum;
          carsWhereByUserIds?: string[];
          carsWherePeriodStart?: string;
          carsWherePeriodEnd?: string;
        };

        const result = await sendMessageTemplateService({
          userId,
          links,
          messageText: text,
          photoIds,
          carsWhereDefaultPeriod,
          carsWhereStock,
          carsWhere,
          carsWherePeriodStart,
          carsWherePeriodEnd,
          carsWhereByUserIds,
        });

        reply.status(200).send(result);
      } catch (error) {
        fastify.log.error("Error sending messageTemplate ", error);
        reply.status(500).send({ error: "Unable to sending messageTemplate" });
      }
    },
  );
  fastify.post(
    "/admin/messageTemplate",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            text: { type: "string" },
            name: { type: "string" },
            photoIds: {
              type: "array",
              items: { type: "string" },
            },
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string" },
                },
                required: ["label", "value"],
              },
            },
          },
          required: ["text", "name"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { name, text, photoIds, links } = request.body as {
          text: string;
          name: string;
          photoIds?: string[];
          links?: { label: string; value: string }[];
        };

        const messageTemplate = await createMessageTemplateService({
          text,
          name,
          photoIds: photoIds || [],
          links: links || [],
        });

        reply.status(201).send(messageTemplate);
      } catch (error) {
        fastify.log.error("Error creating messageTemplate code ", error);
        reply
          .status(500)
          .send({ error: "Unable to create messageTemplate code" });
      }
    },
  );
  fastify.patch(
    "/admin/messageTemplate/:messageTemplateId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            messageTemplateId: { type: "string" },
          },
          required: ["messageTemplateId"],
        },
        body: {
          type: "object",
          properties: {
            text: { type: "string" },
            name: { type: "string" },
            photoIds: {
              type: "array",
              items: { type: "string" },
            },
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  value: { type: "string" },
                },
                required: ["label", "value"],
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { messageTemplateId } = request.params as {
          messageTemplateId: string;
        };
        const { text, name, photoIds, links } = request.body as {
          text?: string;
          name?: string;
          photoIds?: string[];
          links?: { label: string; value: string }[];
        };

        const messageTemplate = await updateMessageTemplateService(
          messageTemplateId,
          {
            text,
            name,
            photoIds,
            links,
          },
        );

        reply.status(201).send(messageTemplate);
      } catch (error) {
        fastify.log.error("Error creating messageTemplate code ", error);
        reply
          .status(500)
          .send({ error: "Unable to create messageTemplate code" });
      }
    },
  );

  fastify.get(
    "/admin/messageTemplate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const list = await getMessageTemplateListService();
      reply.status(200).send(list);
      try {
      } catch (error) {
        fastify.log.error("Error getting messageTemplate list code ", error);
        reply
          .status(500)
          .send({ error: "Unable to getting messageTemplate list code" });
      }
    },
  );

  fastify.get(
    "/admin/messageTemplate/:messageTemplateId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            messageTemplateId: { type: "string" },
          },
          required: ["messageTemplateId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { messageTemplateId } = request.params as {
        messageTemplateId: string;
      };
      const messageTemplate =
        await getMessageTemplateService(messageTemplateId);

      if (!messageTemplate) {
        return reply.status(404).send("messageTemplate not found");
      }
      reply.status(200).send(messageTemplate);
      try {
      } catch (error) {
        fastify.log.error("Error getting messageTemplate list code ", error);
        reply
          .status(500)
          .send({ error: "Unable to getting messageTemplate list code" });
      }
    },
  );
}
