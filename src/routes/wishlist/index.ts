import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { getIdByToken } from "../../utils/auth";
import { getByTgIdUserService } from "../../services/user/getByTgId.user.service";
import { getByUserWishlist } from "../../services/wishlist/getByUser.wishlist";
import { addItemToWishlist } from "../../services/wishlist/addItem.wishlist.service";
import { deleteItemFromWishlist } from "../../services/wishlist/deleteItem.wishlist.service";

interface GetWishlistByUserParams {
  userId: string;
}
interface AddToWishlistParams {
  carCardId: string;
}

export async function wishlistRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.get(
    "/wishlist/user/:userId",
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
        const { userId } = request.params as GetWishlistByUserParams;

        if (
          existUser?.id !== userId &&
          !existUser?.roles.some((role) => role === "ADMIN")
        ) {
          return reply.status(403).send("User is not owner of wishlist");
        }
        const wishlist = await getByUserWishlist(userId);
        reply.status(200).send(wishlist);
      } catch (error) {
        fastify.log.error("Error get wishlist by userID:", error);
        reply.status(500).send({ error: "Unable to get wishlist by userID" });
      }
    },
  );
  fastify.post(
    "/wishlist/add/:carCardId",
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
        const { carCardId } = request.params as AddToWishlistParams;

        if (!existUser?.id) {
          return reply.status(403).send("User is not owner of wishlist");
        }

        const wishlist = await addItemToWishlist(existUser.id, carCardId);

        reply.status(200).send(wishlist);
      } catch (error) {
        fastify.log.error("Error add to wishlist:", error);
        reply.status(500).send({ error: "Unable to add to wishlist" });
      }
    },
  );
  fastify.delete(
    "/wishlist/delete/:carCardId",
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
        const { carCardId } = request.params as AddToWishlistParams;

        if (!existUser?.id) {
          return reply.status(403).send("User is not owner of wishlist");
        }

        const result = await deleteItemFromWishlist(existUser.id, carCardId);

        reply.status(200).send(result);
      } catch (error) {
        fastify.log.error("Error delete to wishlist:", error);
        reply.status(500).send({ error: "Unable to delete to wishlist" });
      }
    },
  );
}
