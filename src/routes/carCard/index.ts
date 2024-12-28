import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getListCarCardService } from "../../services/carCard/getList.carCard.service";
import { getCarCardService } from "../../services/carCard/get.carCard.service";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { isBooleanObject } from "node:util/types";
import { createCarService } from "../../services/carCard/create.carCard.service";
import { parseFiatAsset } from "../../utils/parseFiatAsset";

const carCardsStockFilterEnum = ["all", "inStock", "onOrder"] as const;
type CarCardsStockFilter = (typeof carCardsStockFilterEnum)[number];

interface GetCarCardParams {
  id: string;
}

interface GetCarCardListQuery {
  limit: number;
  offset: number;
  stockFilter: CarCardsStockFilter;
}

interface CreateCarCardBody {
  inStock: boolean;
  description: string;
  price?: string;
  currency?: string;
  isActive: boolean;
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
            stockFilter: { type: "string", enum: carCardsStockFilterEnum },
          },
          required: ["stockFilter"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { stockFilter } = request.query as GetCarCardListQuery;
        if (!carCardsStockFilterEnum.includes(stockFilter)) {
          return reply.status(400).send({ error: "Invalid stockFilter value" });
        }
        const inStock: boolean | undefined =
          stockFilter !== "all" ? stockFilter === "inStock" : undefined;

        const { limit = 10, offset = 0 } = request.query as GetCarCardListQuery;
        const carCards = await getListCarCardService({
          limit,
          offset,
          inStock,
        });
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
  fastify.post(
    "/cars",
    {
      preHandler: authMiddleware,
      schema: {
        body: {
          type: "object",
          properties: {
            inStock: { type: "boolean" },
            description: { type: "string" },
            price: { type: "string" },
            currency: { type: "string" },
            isActive: { type: "boolean" },
          },
          required: ["inStock", "description", "isActive"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // fastify.addHook("preHandler", authMiddleware);

      try {
        const { inStock, currency, description, isActive, price } =
          request.body as CreateCarCardBody;

        const carCard = await createCarService({
          inStock,
          currency: currency ? parseFiatAsset(currency) : null,
          description,
          isActive,
          price,
        });
        reply.status(200).send(carCard);
      } catch (error) {
        console.error("Error create car card: ", error);
        reply.status(500).send({ error: "Unable to create car card" });
      }
    },
  );
}
