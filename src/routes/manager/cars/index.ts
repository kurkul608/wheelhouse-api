import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { managerMiddleware } from "../../../middlewares/managerMiddleware";
import { CarCardsStockFilter, carCardsStockFilterEnum } from "../../carCard";
import { getListManagerCarService } from "../../../services/manager/car/getList.manager.car.service";
import { createCarService } from "../../../services/carCard/create.carCard.service";
import { parseFiatAsset } from "../../../utils/parseFiatAsset";
import { updateCarCardService } from "../../../services/carCard/update.carCard.service";

export const carCardsActiveFilterEnum = ["all", "active", "disabled"] as const;
export type CarCardsActiveFilter = (typeof carCardsActiveFilterEnum)[number];

interface CreateCarCardBody {
  inStock: boolean;
  description: string;
  price?: string;
  currency?: string;
  isActive: boolean;
}

export async function managerCarsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", managerMiddleware);

  fastify.post(
    "/manager/cars",
    {
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

  fastify.get(
    "/manager/cars",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number" },
            offset: { type: "number" },
            stockFilter: { type: "string", enum: carCardsStockFilterEnum },
            activeFilter: { type: "string", enum: carCardsActiveFilterEnum },
          },
          required: ["stockFilter", "activeFilter"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { stockFilter, activeFilter } = request.query as {
        stockFilter: CarCardsStockFilter;
        activeFilter: CarCardsActiveFilter;
      };
      if (!carCardsStockFilterEnum.includes(stockFilter)) {
        return reply.status(400).send({ error: "Invalid stockFilter value" });
      }
      if (!carCardsActiveFilterEnum.includes(activeFilter)) {
        return reply.status(400).send({ error: "Invalid activeFilter value" });
      }

      const inStock: boolean | undefined =
        stockFilter !== "all" ? stockFilter === "inStock" : undefined;

      const isActive: boolean | undefined =
        activeFilter === "all" ? undefined : activeFilter === "active";

      const cars = await getListManagerCarService(!!inStock, isActive);

      reply.status(200).send(cars);
    },
  );

  fastify.patch(
    "/manager/cars/:carId",
    {
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
          required: [],
        },
        params: {
          type: "object",
          properties: {
            carId: { type: "string" },
          },
          required: ["carId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { currency, ...updateData } =
        request.body as Partial<CreateCarCardBody>;
      const { carId } = request.params as { carId: string };
      const carCard = await updateCarCardService(carId, {
        ...updateData,
        currency: currency ? parseFiatAsset(currency) : undefined,
      });

      reply.status(200).send(carCard);
    },
  );
}
