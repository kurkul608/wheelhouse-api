import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";
import { getListUserService } from "../../../services/user/getList.user.service";
import { updateRoleUserService } from "../../../services/user/update-role.user.service";
import { UserRole } from "@prisma/client";
import { getCsvAllUsers } from "../../../services/admin/getCsvAllUsers";
import { bot } from "../../../bot";
import { InputFile } from "grammy";

const queryStringJsonSchema = {
  type: "object",
  properties: {
    searchString: { type: "string" },
  },
};

export async function adminUsersRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", adminMiddleware);

  fastify.get(
    "/admin/users",
    {
      schema: {
        querystring: queryStringJsonSchema,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { searchString } = request.query as { searchString?: string };

        const users = await getListUserService(searchString);

        reply.status(200).send(users);
      } catch (error) {
        fastify.log.error("Error getting admin users", error);
        reply.status(500).send({ error: "Unable to get users list" });
      }
    },
  );
  fastify.post(
    "/admin/users/send-csv",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            userId: { type: "number" },
          },
          required: ["userId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = request.body as { userId: number };

        const csv = await getCsvAllUsers();

        const buffer = Buffer.from(csv, "utf-8");

        await bot.api.sendDocument(
          userId,
          new InputFile(buffer, "users_all.csv"),
        );

        reply.status(200).send({ success: true, message: "Send to telegram" });
      } catch (error) {
        fastify.log.error("Error getting admin users", error);
        reply.status(500).send({ error: "Unable to get users list" });
      }
    },
  );
  fastify.patch(
    "/admin/users/:userId/role/:role",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            userId: { type: "string" },
            role: { type: "string" },
          },
          required: ["userId", "role"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId, role } = request.params as {
          userId: string;
          role: string;
        };
        const user = await updateRoleUserService(userId, role as UserRole);
        reply.status(200).send(user);
      } catch (error) {
        fastify.log.error("Error updating admin users", error);
        reply.status(500).send({ error: "Unable to to update user role" });
      }
    },
  );
}
