import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { managerMiddleware } from "../../../middlewares/managerMiddleware";
import { createManySpecificationService } from "../../../services/specification/createMany.specification.service";
import { createSpecificationService } from "../../../services/specification/create.specification.service";
import { Prisma } from "@prisma/client";

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
          field: data.field,
          fieldName: data.fieldName,
          value: data.value,
          carCardId: data.carCardId,
        } as unknown as Prisma.SpecificationCreateInput);

        reply.status(201).send(specification);
      } catch (error) {
        console.error("Error create car card: ", error);
        reply.status(500).send({ error: "Unable to create car card" });
      }
    },
  );
}
