import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { getIdByToken } from "../../utils/auth";
import { getByTgIdUserService } from "../../services/user/getByTgId.user.service";
import { createOrder } from "../../services/order/create.order";

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post(
    "/orders",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            carId: { type: "string" },
          },
          required: ["carId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userTgId = getIdByToken(request.headers.authorization || "");
      const existUser = await getByTgIdUserService(userTgId);
      const { carId } = request.body as { carId: string };

      if (!existUser) {
        return reply.status(404).send("user not found");
      }

      const order = await createOrder(carId, existUser.id);

      return reply.status(201).send(order);
    },
  );
}
