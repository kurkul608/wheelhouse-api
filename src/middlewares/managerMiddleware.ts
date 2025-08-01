import { FastifyRequest, FastifyReply } from "fastify";
import process from "process";
import crypto from "crypto";
import { getIdByToken } from "../utils/auth";
import { getByTgIdUserService } from "../services/user/getByTgId.user.service";

export async function managerMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const userTgId = getIdByToken(req.headers.authorization || "");
  const user = await getByTgIdUserService(userTgId);

  if (user?.roles.some((role) => role.includes("MANAGER"))) {
    return;
  } else {
    reply.status(403).send({ message: "Only for managers" });
  }
}
