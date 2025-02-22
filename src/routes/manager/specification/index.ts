import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { managerMiddleware } from "../../../middlewares/managerMiddleware";
import { createManySpecificationService } from "../../../services/specification/createMany.specification.service";
import { createSpecificationService } from "../../../services/specification/create.specification.service";
import { Prisma } from "@prisma/client";
import { deleteSpecificationService } from "../../../services/specification/delete.specification.service";
import { trim } from "lodash";

interface CreateSpecificationBody {
  value: string;
  field: string;
  fieldName: string;
  carCardId: string;
}

export async function managerSpecificationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", managerMiddleware);

  fastify.post(
    "/manager/specifications",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            value: { type: "string" },
            field: { type: "string" },
            fieldName: { type: "string" },
            carCardId: { type: "string" },
          },
          required: ["value", "field", "fieldName", "carCardId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const data = request.body as CreateSpecificationBody;

        const specification = await createSpecificationService({
          field: trim(data.field),
          fieldName: trim(data.fieldName),
          value: trim(data.value),
          carCardId: data.carCardId,
        } as unknown as Prisma.SpecificationCreateInput);

        reply.status(201).send(specification);
      } catch (error) {
        console.error("Error create car card: ", error);
        reply.status(500).send({ error: "Unable to create car card" });
      }
    },
  );
  fastify.delete(
    "/manager/specifications/:specificationId",
    {
      schema: {
        params: {
          type: "object",
          properties: { specificationId: { type: "string" } },
          required: ["specificationId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { specificationId } = request.params as {
          specificationId: string;
        };
        const res = await deleteSpecificationService(specificationId);
        return reply.status(200).send(res);
      } catch (error) {
        return reply.status(500).send({ error: "Unable to delete car card" });
      }
    },
  );
}
