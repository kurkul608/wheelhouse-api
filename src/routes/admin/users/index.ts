import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { getListUserService } from "../../../services/user/getList.user.service";

export async function adminUsersRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", adminMiddleware);

  fastify.get(
    "/admin/users",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const users = await getListUserService();

        reply.status(200).send(users);
      } catch (error) {
        fastify.log.error("Error getting admin users", error);
        reply.status(500).send({ error: "Unable to get users list" });
      }
    },
  );
}
