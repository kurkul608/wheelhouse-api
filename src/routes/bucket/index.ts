import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getByUserBucket } from "../../services/bucket/getByUser.bucket";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { getIdByToken } from "../../utils/auth";
import { getByTgIdUserService } from "../../services/user/getByTgId.user.service";
import { addItemToBucket } from "../../services/bucket/addItem.bucket.service";
import * as repl from "node:repl";
import { deleteItemFromBucket } from "../../services/bucket/deleteItem.bucket.service";

interface GetBucketByUserParams {
  userId: string;
}
interface AddToBucketParams {
  carCardId: string;
}

export async function bucketRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get(
    "/bucket/user/:userId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            userId: { type: "string" },
          },
          required: ["userId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userTgId = getIdByToken(request.headers.authorization || "");
        const existUser = await getByTgIdUserService(userTgId);
        const { userId } = request.params as GetBucketByUserParams;

        if (
          existUser?.id !== userId &&
          !existUser?.roles.some((role) => role === "ADMIN")
        ) {
          return reply.status(403).send("User is not owner of bucket");
        }
        const bucket = await getByUserBucket(userId);
        reply.status(200).send(bucket);
      } catch (error) {
        fastify.log.error("Error get bucket by userID:", error);
        reply.status(500).send({ error: "Unable to get bucket by userID" });
      }
    },
  );
  fastify.post(
    "/bucket/add/:carCardId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            carCardId: { type: "string" },
          },
          required: ["carCardId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userTgId = getIdByToken(request.headers.authorization || "");
        const existUser = await getByTgIdUserService(userTgId);
        const { carCardId } = request.params as AddToBucketParams;

        if (!existUser?.id) {
          return reply.status(403).send("User is not owner of bucket");
        }

        const bucket = await addItemToBucket(existUser.id, carCardId);

        reply.status(200).send(bucket);
      } catch (error) {
        fastify.log.error("Error add to bucket:", error);
        reply.status(500).send({ error: "Unable to add to bucket" });
      }
    },
  );
  fastify.delete(
    "/bucket/delete/:carCardId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            carCardId: { type: "string" },
          },
          required: ["carCardId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userTgId = getIdByToken(request.headers.authorization || "");
        const existUser = await getByTgIdUserService(userTgId);
        const { carCardId } = request.params as AddToBucketParams;

        if (!existUser?.id) {
          return reply.status(403).send("User is not owner of bucket");
        }

        const result = await deleteItemFromBucket(existUser.id, carCardId);

        reply.status(200).send(result);
      } catch (error) {
        fastify.log.error("Error add to bucket:", error);
        reply.status(500).send({ error: "Unable to add to bucket" });
      }
    },
  );
}
