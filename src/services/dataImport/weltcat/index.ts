import { server } from "../../../server";
import { getByExternalIdCarCardService } from "../../carCard/getByExternalId.carCard.service";
import { createCarService } from "../../carCard/create.carCard.service";
import { createManySpecificationService } from "../../specification/createMany.specification.service";
import { setDisableManyCarCardService } from "../../carCard/setDisableMany.carCard.service";
import { parseFiatAsset } from "../../../utils/parseFiatAsset";
import { Agent } from "node:https";
import { generateCarOpenaiService } from "../../openai/generateCar.openai.service";

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

// https://api.weltcar.de/api/cars/list/json
export const WELT_CAR_DATA_PATH = "cars/list/json";

export const getAndSaveWeltCarData = async () => {
  server.log.info("Import weltcar data starting...");

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
    for (let i = 0; i < weltCarData.length; i += BATCH_SIZE) {
      const batch = weltCarData.slice(i, i + BATCH_SIZE);

      server.log.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`);

      await Promise.all(
        batch.map(async (weltCar) => {
          const externalId = `weltcar-${weltCar.id}`;
          externalIds.push(externalId);
          const extendCarCard = await getByExternalIdCarCardService(externalId);
          if (extendCarCard) return;

          const specs = await generateCarOpenaiService(JSON.stringify(weltCar));

          const carCard = await createCarService({
            currency: parseFiatAsset(weltCar.currency),
            description: specs?.description || "",
            isActive: true,
            inStock: false,
            importedPhotos: weltCar.media,
            price: weltCar.price ? String(weltCar.price) : null,
            externalId: externalId,
          });

          if (specs?.data) {
            await createManySpecificationService(
              specs.data.map((spec) => ({ ...spec, carCardId: carCard.id })),
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

    await setDisableManyCarCardService(externalIds);

    server.log.info("Import weltcar data finished");
  } catch (error) {
    server.log.error(error);
  }
};
