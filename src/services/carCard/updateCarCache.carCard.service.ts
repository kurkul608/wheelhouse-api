import { generateCarCardKey } from "../../utils/redisKeys/generateCarCardKey";
import { redisClient } from "../../redisClient";
import { getCarCardService } from "./get.carCard.service";
import { bot } from "../../bot";

export const updateCarCacheCarCardService = async (carId: string) => {
  const key = generateCarCardKey(carId);

  const message = await bot.api.sendMessage(
    process.env.SERVICE_CHAT || "",
    `Начат процесс обновления автомобиля ${carId}`,
  );

  const cachedData = await redisClient.get(key);
  if (cachedData) {
    await redisClient.del(key);
    await getCarCardService(carId);
  }

  await bot.api.sendMessage(
    process.env.SERVICE_CHAT || "",
    "Процесс обновления окончен",
    { reply_to_message_id: message.message_id },
  );
};
