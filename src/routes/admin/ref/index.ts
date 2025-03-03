import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { createRefService } from "../../../services/ref/create.refService";
import { getRefService } from "../../../services/ref/get.refService";
import { getListRefService } from "../../../services/ref/getList.refService";

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
        const ref = await getRefService(refId);

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
}
