import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { createRefService } from "../../../services/ref/create.refService";
import { getRefService } from "../../../services/ref/get.refService";
import { getListRefService } from "../../../services/ref/getList.refService";
import { getCsvUsersByRef } from "../../../services/admin/getCsvUsersByRef";
import { bot } from "../../../bot";
import { getByTgIdUserService } from "../../../services/user/getByTgId.user.service";
import { InputFile } from "grammy";
import { getCsvUsersByRefWithOrder } from "../../../services/admin/getCsvUsersByRefWithOrder";

export async function adminRefRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", adminMiddleware);

  fastify.post(
    "/admin/ref",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            startDate: { type: "string", format: "date-time" },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { name, startDate } = request.body as {
          name: string;
          startDate: string;
        };
        const ref = await createRefService({ name, startDate });

        reply.status(201).send(ref);
      } catch (error) {
        fastify.log.error("Error creating ref code ", error);
        reply.status(500).send({ error: "Unable to create ref code" });
      }
    },
  );
  fastify.get(
    "/admin/ref/:refId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            refId: { type: "string" },
          },
          required: ["refId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refId } = request.params as {
          refId: string;
        };
        const ref = await getRefService(refId, true);

        if (!ref) {
          return reply.status(404).send({ message: "Ref Not Found" });
        }

        reply.status(201).send(ref);
      } catch (error) {
        fastify.log.error("Error creating ref code ", error);
        reply.status(500).send({ error: "Unable to create ref code" });
      }
    },
  );

  fastify.get(
    "/admin/ref",

    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const ref = await getListRefService();

        if (!ref) {
          return reply.status(404).send({ message: "Ref Not Found" });
        }

        reply.status(201).send(ref);
      } catch (error) {
        fastify.log.error("Error creating ref code ", error);
        reply.status(500).send({ error: "Unable to create ref code" });
      }
    },
  );

  fastify.post(
    "/admin/ref/:refId/users-csv",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            refId: { type: "string" },
          },
          required: ["refId"],
        },
        body: {
          type: "object",
          properties: {
            userId: { type: "number" },
          },
          required: ["userId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refId } = request.params as {
          refId: string;
        };
        const { userId } = request.body as { userId: number };
        const csv = await getCsvUsersByRef(refId);

        const buffer = Buffer.from(csv, "utf-8");

        await bot.api.sendDocument(userId, new InputFile(buffer, "users.csv"));

        reply.status(200).send({ success: true, message: "Send to telegram" });
      } catch (error) {
        fastify.log.error("Error getting csv users by ref code", error);
        reply.status(500).send({ message: "Unable to send csv" });
      }
    },
  );

  fastify.post(
    "/admin/ref/:refId/users-csv-with-orders",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            refId: { type: "string" },
          },
          required: ["refId"],
        },
        body: {
          type: "object",
          properties: {
            userId: { type: "number" },
          },
          required: ["userId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refId } = request.params as {
          refId: string;
        };
        const { userId } = request.body as { userId: number };
        const csv = await getCsvUsersByRefWithOrder(refId);

        const buffer = Buffer.from(csv, "utf-8");

        await bot.api.sendDocument(
          userId,
          new InputFile(buffer, "users_with_orders.csv"),
        );

        reply.status(200).send({ success: true, message: "Send to telegram" });
      } catch (error) {
        fastify.log.error("Error getting csv users by ref code", error);
        reply.status(500).send({ message: "Unable to send csv" });
      }
    },
  );
}
