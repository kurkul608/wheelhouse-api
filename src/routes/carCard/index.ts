import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getListCarCardService } from "../../services/carCard/getList.carCard.service";
import { getCarCardService } from "../../services/carCard/get.carCard.service";
import { authMiddleware } from "../../middlewares/authMiddleware";

interface GetCarCardParams {
  id: string;
}

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
  fastify.get(
    "/cars/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as GetCarCardParams;
        const catCard = await getCarCardService(id);
        reply.status(200).send(catCard);
      } catch (error) {
        console.error("Error get cars card:", error);
        reply.status(500).send({ error: "Unable to get cars card" });
      }
    },
  );
}
