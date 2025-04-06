import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { getIdByToken } from "../../utils/auth";
import { getByTgIdUserService } from "../../services/user/getByTgId.user.service";
import { bot } from "../../bot";
import { createUserService } from "../../services/user/create.user.service";
import { UserRole } from "@prisma/client";
import { clickRefService } from "../../services/ref/click.refService";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post(
    "/users/register",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            refId: { type: "string" },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refId } = request.body as { refId?: string };

        if (refId) {
          clickRefService(refId).catch((error) => {
            console.error(error);
          });
        }

        const userTgId = getIdByToken(request.headers.authorization || "");
        const existUser = await getByTgIdUserService(userTgId);

        if (existUser) {
          return reply.status(200).send(existUser);
        }

        const userChat = await bot.api.getChat(userTgId);

        const user = await createUserService(
          {
            tgId: userTgId,
            username: userChat.username,
            firstName: userChat.first_name,
            lastName: userChat.last_name,
            roles: [UserRole.USER],
          },
          refId,
        );

        return reply.status(200).send(user);
      } catch (error) {
        console.error("Error register user:", error);
        reply.status(500).send({ error: "Unable to register user" });
      }
    },
  );
}
