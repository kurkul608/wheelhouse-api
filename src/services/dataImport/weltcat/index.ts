import { server } from "../../../server";
import { getByExternalIdCarCardService } from "../../carCard/getByExternalId.carCard.service";
import { createCarService } from "../../carCard/create.carCard.service";
import { createManySpecificationService } from "../../specification/createMany.specification.service";
import { setDisableManyCarCardService } from "../../carCard/setDisableMany.carCard.service";
import { parseFiatAsset } from "../../../utils/parseFiatAsset";

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
export const WELT_CAR_DATA_PATH = "cars/list/json";

export const getAndSaveWeltCarData = async () => {
  server.log.info("Import weltcar data starting...");

  try {
    const weltCarData: WeltCarData[] = (
      await server.axios.clientWeltCar.get<WeltCarData[]>(WELT_CAR_DATA_PATH)
    ).data;
    server.log.info(`Data loaded. Total cars: ${weltCarData.length}`);
    const externalIds: string[] = [];
    for (const weltCar of weltCarData) {
      const externalId = `weltcar-${weltCar.id}`;
      externalIds.push(externalId);
      const extendCarCard = await getByExternalIdCarCardService(externalId);
      if (extendCarCard) {
        continue;
      }

      const carCard = await createCarService({
        currency: parseFiatAsset(weltCar.currency),
        description: weltCar.description,
        isActive: true,
        inStock: false,
        importedPhotos: weltCar.media,
        price: weltCar.price ? String(weltCar.price) : null,
        externalId: externalId,
      });

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
          fieldName: "Год выпуска",
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
    }
    server.log.info("Start disable car cards");

    await setDisableManyCarCardService(externalIds);

    server.log.info("Import weltcar data finished");
  } catch (error) {
    server.log.error(error);
  }
};
