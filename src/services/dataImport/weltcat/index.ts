import { server } from "../../../server";
import { getByExternalIdCarCardService } from "../../carCard/getByExternalId.carCard.service";
import { createManySpecificationService } from "../../specification/createMany.specification.service";
import { setDisableManyCarCardService } from "../../carCard/setDisableMany.carCard.service";
import { parseFiatAsset } from "../../../utils/parseFiatAsset";
import { Agent } from "node:https";
import { generateCarOpenaiService } from "../../openai/generateCar.openai.service";
import { getAllByExternalIdCarCardService } from "../../carCard/getAllByExternalId.carCard.service";
import { bot } from "../../../bot";
import { Prisma } from "@prisma/client";
import { chunkArray } from "../../../utils/chunkArray";
import { InlineKeyboard } from "grammy";
import { getMiniAppLink } from "../../../utils/getMiniAppLink";
import { createExternalCarService } from "../../carCard/createExternal.carCard.service";
import { updateListCacheCarCardService } from "../../carCard/updateListCache.carCard.service";

export interface WeltCarData {
  id: string;
  model: string;
  specification: string;
  year: number;
  vin: string;
  price: number;
  currency: string;
  media: string[];
  color_ext: string;
  color_int: string;
  color_ext_simple: string;
  color_int_simple: string;
  description: string;
}
const BATCH_SIZE = 3;
const DELAY_MS = 20_000;
const WELT_CAR_ID = "weltcar-";

export const WELT_CAR_DATA_PATH = "cars/list/json";

export const getAndSaveWeltCarData = async () => {
  server.log.info("Import weltcar data starting...");
  await bot.api.sendMessage(
    process.env.SERVICE_CHAT || "",
    "Начат импорт данных",
  );

  try {
    const data = (
      await server.axios.clientWeltCar.get<WeltCarData[]>(WELT_CAR_DATA_PATH, {
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
      })
    ).data;
    const weltCarData: WeltCarData[] = process.env.LOCAL
      ? data.slice(0, 7)
      : data;

    server.log.info(`Data loaded. Total cars: ${weltCarData.length}`);
    const externalIds: string[] = [];
    const addedCarCards: Prisma.CarCardGetPayload<{
      include: { specifications: true };
    }>[] = [];
    for (let i = 0; i < weltCarData.length; i += BATCH_SIZE) {
      const batch = weltCarData.slice(i, i + BATCH_SIZE);

      server.log.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`);

      await Promise.all(
        batch.map(async (weltCar) => {
          try {
            const externalId = `${WELT_CAR_ID}${weltCar.id}`;
            externalIds.push(externalId);
            const extendCarCard =
              await getByExternalIdCarCardService(externalId);
            if (extendCarCard && extendCarCard.specifications.length > 2) {
              server.log.info(`externalId exist: ${externalId}`);
              return;
            }

            let specs = null;
            try {
              specs = await generateCarOpenaiService(JSON.stringify(weltCar));
              server.log.info(`externalId: ${externalId}`);
              server.log.info(`specs: ${JSON.stringify(specs)}}`);
            } catch (openAiError) {
              server.log.warn(
                `OpenAI error for car ${externalId}: ${(openAiError as { message: string }).message}`,
              );
            }

            const carCard = await createExternalCarService({
              currency: parseFiatAsset(weltCar.currency),
              description: specs?.description || "",
              isActive: true,
              inStock: false,
              importedPhotos: weltCar.media,
              price: weltCar.price ? String(weltCar.price) : null,
              externalId: externalId,
            });
            let specifications: Prisma.SpecificationGetPayload<any>[] = [];
            if (specs?.data) {
              specifications = await createManySpecificationService(
                specs.data.map((spec) => ({ ...spec, carCardId: carCard.id })),
              );
            }
            addedCarCards.push({ ...carCard, specifications: specifications });
          } catch (error) {
            server.log.error(
              `Error processing car ${weltCar.id}: ${(error as { message: string }).message}`,
            );
          }
        }),
      );

      if (i + BATCH_SIZE < weltCarData.length) {
        server.log.info(
          `Waiting ${DELAY_MS / 1000} seconds before next batch...`,
        );
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    server.log.info("Start disable car cards");

    const deactivatedCards = await setDisableManyCarCardService(
      WELT_CAR_ID,
      externalIds,
    );

    updateListCacheCarCardService().catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });

    await bot.api.sendMessage(
      process.env.MANAGER_CHAT || "",
      `Импорт данных окончен
      Всего получено от партнера ${process.env.WELT_CAR_BASE_URL} ${externalIds.length} автомобилей
      Добавлено новых автомобилей: ${addedCarCards.length} автомобилей
      Автомобилей деактивировано: ${deactivatedCards.length} автомобилей`,
    );

    const carCardsChunks = chunkArray(addedCarCards);
    for (const carCardsChunk of carCardsChunks) {
      const keyboard = carCardsChunk.reduce((inlineKeyboard, carCard) => {
        const model = carCard.specifications.find(
          (spec) => spec.field === "model",
        );
        return inlineKeyboard
          .url(
            `Авто - ${model?.value || carCard.id}`,
            getMiniAppLink({ carId: carCard.id }),
          )
          .row();
      }, new InlineKeyboard());

      await bot.api.sendMessage(
        process.env.MANAGER_CHAT || "",
        "Список добавленных авто",
        { reply_markup: keyboard },
      );
    }

    server.log.info("Import weltcar data finished");
  } catch (error) {
    await bot.api.sendMessage(
      process.env.SERVICE_CHAT || "",
      "Во время импорта произошла ошибка, импорт остановлен",
    );
    server.log.error(
      `General error in import process: ${(error as { message: string }).message}`,
    );
  }
};
