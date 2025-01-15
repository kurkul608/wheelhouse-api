import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { managerMiddleware } from "../../../middlewares/managerMiddleware";
import { createManySpecificationService } from "../../../services/specification/createMany.specification.service";

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
          type: "array",
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
        const data = request.body as CreateSpecificationBody[];

        const specifications = await createManySpecificationService(data);

        reply.status(200).send({ message: "success" });
      } catch (error) {
        console.error("Error create car card: ", error);
        reply.status(500).send({ error: "Unable to create car card" });
      }
    },
  );
}
