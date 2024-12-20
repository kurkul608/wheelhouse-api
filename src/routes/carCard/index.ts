import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getListCarCardService } from "../../services/carCard/getList.carCard.service";

interface GetCarCardListQuery {
  limit: number;
  offset: number;
}
export async function carCardRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/cars",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number" },
            offset: { type: "number" },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { limit = 10, offset = 0 } = request.query as GetCarCardListQuery;
        const carCards = await getListCarCardService({ limit, offset });
        reply.status(200).send(carCards);
      } catch (error) {
        console.error("Error get cars card:", error);
        reply.status(500).send({ error: "Unable to get cars card" });
      }
    },
  );
}
