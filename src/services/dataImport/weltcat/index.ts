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
export const WELT_CAR_BASE_URL = "https://api.weltcar.de/api/";
export const WELT_CAR_DATA_PATH = "cars/list/json";
// const getWeltCarData = async (): Promise<WeltCarData[]> => {
//     const weltCarData = await
// }
