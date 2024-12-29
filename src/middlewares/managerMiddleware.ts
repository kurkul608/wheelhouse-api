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

// function validateTelegramData(telegramInitData: string) {
//   const botToken = process.env.BOT_TOKEN || "";
//   const encoded = decodeURIComponent(telegramInitData);
//
//   const secret = crypto.createHmac("sha256", "WebAppData").update(botToken);
//
//   const arr = encoded.split("&");
//   const hashIndex = arr.findIndex((str) => str.startsWith("hash="));
//   const hash = arr.splice(hashIndex)[0].split("=")[1];
//   arr.sort((a, b) => a.localeCompare(b));
//   const dataCheckString = arr.join("\n");
//
//   const _hash = crypto
//     .createHmac("sha256", secret.digest())
//     .update(dataCheckString)
//     .digest("hex");
//
//   return _hash === hash;
// }
