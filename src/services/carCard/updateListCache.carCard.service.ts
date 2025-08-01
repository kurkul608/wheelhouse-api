import Bottleneck from "bottleneck";
import { parseCarCardListKey } from "../../utils/redisKeys/parseCarCardListKey";
import { CAR_CARD_LIST_PREFIX } from "../../utils/redisKeys/generateCarCardListKey";
import { redisClient } from "../../redisClient";
import { getListCarCardService } from "./getList.carCard.service";
import { bot } from "../../bot";

export const processKey = async (key: string): Promise<void> => {
  const params = parseCarCardListKey(key);
  await redisClient.del(key);
  await getListCarCardService(params);
  // if (params.inStock) {
  //   console.log(data);
  // }
};

export const updateListCacheCarCardService = async () => {
  const pattern = `${CAR_CARD_LIST_PREFIX}*`;
  const keys = await redisClient.keys(pattern);
  const limiter = new Bottleneck({
    minTime: 5000,
  });
  const message = await bot.api.sendMessage(
    process.env.SERVICE_CHAT || "",
    "Начат процесс обновления кэшированных карточек автомобилей",
  );

  for (const key of keys) {
    await limiter.schedule(() => processKey(key));
  }
  await bot.api.sendMessage(
    process.env.SERVICE_CHAT || "",
    "Процесс обновления кэшированных карточек автомобилей окончен",
    {
      reply_to_message_id: message.message_id,
    },
  );
};
