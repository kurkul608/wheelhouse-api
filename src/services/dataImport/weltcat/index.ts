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
import { updateCarCardService } from "../../carCard/update.carCard.service";
import { getAllExternalManagerCarService } from "../../manager/car/getAllExternalActive.manager.car.service";
import prisma from "../../../prisma";

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
export const WELT_CAR_ID = "weltcar-";

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
    await bot.api.sendMessage(
      process.env.SERVICE_CHAT || "",
      `Получено авто от партнеров ${weltCarData.length}`,
    );

    const externalIds: string[] = [];
    const addedCarCards: Prisma.CarCardGetPayload<{
      include: { specifications: true };
    }>[] = [];

    for (const weltCar of weltCarData) {
      try {
        const externalId = `${WELT_CAR_ID}${weltCar.id}`;
        externalIds.push(externalId);

        const extendCarCard = await getByExternalIdCarCardService(externalId);
        if (weltCar.id === "NK-MG-0325-2678") {
          console.log("NK-MG-0325-2678");
          console.log(extendCarCard);
        }
        if (extendCarCard && extendCarCard.specifications.length > 2) {
          server.log.info(`externalId exist: ${externalId}`);
          if (!extendCarCard.isActive) {
            await prisma.carCard.update({
              where: { id: extendCarCard.id },
              data: { isActive: true },
            });
          }

          continue;
        }

        let specs = null;
        try {
          specs = await generateCarOpenaiService(JSON.stringify(weltCar));
          server.log.info(`externalId: ${externalId}`);
          server.log.info(`specs: ${JSON.stringify(specs)}`);
        } catch (openAiError) {
          server.log.warn(
            `OpenAI error for car ${externalId}: ${(openAiError as { message: string }).message}`,
          );
        }

        const model = specs?.data.find((spec) => spec.field === "model");
        const specification = specs?.data.find(
          (spec) => spec.field === "specification",
        );
        const year = specs?.data.find((spec) => spec.field === "year");
        const vin = specs?.data.find((spec) => spec.field === "vin");

        const carCard = await createExternalCarService({
          currency: parseFiatAsset(weltCar.currency),
          description: specs?.description || "",
          isActive: true,
          inStock: false,
          importedPhotos: weltCar.media,
          price: weltCar.price ? String(weltCar.price) : null,
          externalId: externalId,
          carModel: model?.value ?? weltCar.model,
          carBrand: specification?.value ?? weltCar.specification,
          carYear: year?.value ?? String(weltCar.year),
          carVin: vin?.value ?? String(weltCar.vin),
        });

        let specifications: Prisma.SpecificationGetPayload<any>[] = [];
        if (specs?.data) {
          specifications = await createManySpecificationService(
            specs.data.map((spec) => ({ ...spec, carCardId: carCard.id })),
          );
        }
        addedCarCards.push({ ...carCard, specifications: specifications });
      } catch (error) {
        await bot.api.sendMessage(
          process.env.SERVICE_CHAT || "",
          `Error processing car ${weltCar.id}: ${(error as { message: string }).message}`,
        );
        server.log.error(
          `Error processing car ${weltCar.id}: ${(error as { message: string }).message}`,
        );
      }
    }

    await bot.api.sendMessage(
      process.env.SERVICE_CHAT || "",
      `Начали леактивацию атомобилей. Количество авто под деактивацию - ${externalIds.length}`,
    );
    server.log.info("Start disable car cards");

    const allActiveExternalCars = await getAllExternalManagerCarService();
    console.log("allActiveExternalCars.len: ", allActiveExternalCars.length);

    const filteredCarIds = allActiveExternalCars
      .filter(
        (carCard) =>
          carCard.externalId && !externalIds.includes(carCard.externalId),
      )
      .map((carCard) => carCard.id);

    const deactivatedCards = await setDisableManyCarCardService(filteredCarIds);

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
