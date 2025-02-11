import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getListCarCardService } from "../../services/carCard/getList.carCard.service";
import { getCarCardService } from "../../services/carCard/get.carCard.service";

export const carCardsStockFilterEnum = ["all", "inStock", "onOrder"] as const;
export type CarCardsStockFilter = (typeof carCardsStockFilterEnum)[number];

interface GetCarCardParams {
  id: string;
}

interface GetCarCardListQuery {
  limit: number;
  offset: number;
  maxDateFilter?: number;
  minDateFilter?: number;
  search: string;
  sortOrder: string;
  sortBy: string;
  stockFilter: CarCardsStockFilter;
  carModelFilter?: string[];
  carBrandFilter?: string[];
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
            search: { type: "string" },
            sortBy: { type: "string" },
            sortOrder: { type: "string" },
            maxDateFilter: { type: "number" },
            minDateFilter: { type: "number" },
            carModelFilter: { type: "array" },
            carBrandFilter: { type: "array" },
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

        const {
          limit = 10,
          offset = 0,
          search,
          carBrandFilter,
          carModelFilter,
          maxDateFilter,
          minDateFilter,
          sortBy,
          sortOrder,
        } = request.query as GetCarCardListQuery;
        const carCards = await getListCarCardService({
          limit,
          offset,
          inStock,
          searchString: search,
          carBrandFilter,
          carModelFilter,
          minDateFilter,
          maxDateFilter,
          sortBy,
          sortOrder,
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
}
