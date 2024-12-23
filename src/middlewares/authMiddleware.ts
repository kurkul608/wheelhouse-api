import { FastifyRequest, FastifyReply } from "fastify";
import process from "process";
import crypto from "crypto";

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const token = req.headers.authorization;
  console.log(token);
  const publicRoutes = ["/pay"];
  if (publicRoutes.includes(req.url)) {
    return;
  }

  if (token && validateTelegramData(token)) {
    return; // Если проверка прошла, продолжаем выполнение запроса
  } else {
    reply.status(401).send({ message: "Unauthorized" }); // Возвращаем ошибку "Unauthorized"
  }
}

function validateTelegramData(telegramInitData: string) {
  const botToken = process.env.BOT_TOKEN || "";
  const encoded = decodeURIComponent(telegramInitData);

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken);

  const arr = encoded.split("&");
  const hashIndex = arr.findIndex((str) => str.startsWith("hash="));
  const hash = arr.splice(hashIndex)[0].split("=")[1];
  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join("\n");

  const _hash = crypto
    .createHmac("sha256", secret.digest())
    .update(dataCheckString)
    .digest("hex");

  return _hash === hash;
}
