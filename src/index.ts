import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import { bot } from "./bot";
import fastifyAxios from "fastify-axios";
import {
  WELT_CAR_BASE_URL,
  WELT_CAR_DATA_PATH,
  WeltCarData,
} from "./services/dataImport/weltcat";
import { scheduleJob } from "node-schedule";
import { createCarService } from "./services/carCard/create.carCard.service";
import { FiatAsset } from "@prisma/client";
import { createManySpecificationService } from "./services/specification/createMany.specification.service";
import { getByExternalIdCarCardService } from "./services/carCard/getByExternalId.carCard.service";

dotenv.config();

const server = fastify({ logger: true });

server.register(fastifyCors, {
  origin: true,
});

server.register(fastifyAxios, {
  clients: {
    clientWeltCar: { baseURL: WELT_CAR_BASE_URL },
  },
});

server.setErrorHandler((error, request, reply) => {
  server.log.error(error);

  reply.status(500).send({
    success: false,
    message: "Server error.",
  });
});

bot.start().then(() => {
  console.log("Telegram Bot started!");
});

const getAndSaveWeltCarData = async () => {
  console.log("Import weltcar data starting...");
  const weltCarData: WeltCarData[] = (
    await server.axios.clientWeltCar.get<WeltCarData[]>(WELT_CAR_DATA_PATH)
  ).data;
  console.log("Data loaded");
  console.log(weltCarData.length);
  for (const weltCar of weltCarData) {
    const externalId = `weltcar-${weltCar.id}`;
    const extendCarCard = await getByExternalIdCarCardService(externalId);
    if (extendCarCard) {
      console.log("CarCard found");
      continue;
    }

    const carCard = await createCarService({
      // TODO Добавить функцию, которая будет приводить строку к FiatAsset
      currency: weltCar.currency as FiatAsset,
      description: weltCar.description,
      isActive: true,
      importedPhotos: weltCar.media,
      price: String(weltCar.price),
      externalId: externalId,
    });
    console.log(`${carCard.id} created`);

    await createManySpecificationService([
      {
        carCardId: carCard.id,
        value: weltCar.color_ext,
        field: "color_ext",
        fieldName: "Цвет экстерьера",
      },
      {
        carCardId: carCard.id,
        value: weltCar.color_int,
        field: "color_int",
        fieldName: "Цвет интерьера",
      },
      {
        carCardId: carCard.id,
        value: String(weltCar.year),
        field: "year",
        fieldName: "Год выпоуска",
      },
      {
        carCardId: carCard.id,
        value: weltCar.vin,
        field: "vin",
        fieldName: "VIN номер",
      },
      {
        carCardId: carCard.id,
        value: weltCar.model,
        field: "model",
        fieldName: "Модель",
      },
      {
        carCardId: carCard.id,
        value: weltCar.specification,
        field: "specification",
        fieldName: "Спецификация",
      },
    ]);
    console.log(`Specifications to ${carCard.id} added`);
  }
  console.log("Import weltcar data finished");
};

scheduleJob("0 */12 * * *", async () => {
  await getAndSaveWeltCarData();
});

server.listen(
  { port: +(process.env.PORT || ""), host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  },
);
