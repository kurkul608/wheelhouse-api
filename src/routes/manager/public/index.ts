import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getCarManagerService } from "../../../services/manager/car/getCar.manager.service";

export const carCardsActiveFilterEnum = ["all", "active", "disabled"] as const;

export async function managerPublicRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/manager/public/cars/:carId",
    {
      schema: {
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
      try {
        const { carId } = request.params as { carId: string };

        const carCard = await getCarManagerService(carId);

        reply.status(200).send(carCard);
      } catch (error) {
        console.error("Error get car:", error);
        reply.status(500).send({ error: "Unable to get car" });
      }
    },
  );
}
