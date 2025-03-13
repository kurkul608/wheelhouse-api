import fastifyAxios from "fastify-axios";
import { server } from "../../server";

interface MetrikaParams {
  clientID: string;
  eventType: "pageview" | "event";
}

interface MetrikaParamsPageView extends MetrikaParams {
  eventType: "pageview";
  pageURL: string;
  pageTitle: string;
  prevPage: string;
}
interface MetrikaParamsEvent extends MetrikaParams {
  eventType: "event";
  transaction: string;
  pageURL?: string;
  target: string;
  price: string;
  coupon: string;
  currency: string;
}

export async function sendEventToYandexMetrika(
  data: MetrikaParamsPageView | MetrikaParamsEvent,
): Promise<void> {
  if (!data.clientID) {
    console.warn("clientID не найден. Событие не отправлено.");
    return;
  }

  if (!process.env.METRIKA_ID) {
    console.warn("METRIKA_ID не найден. Событие не отправлено.");
    return;
  }

  if (!process.env.MS_TOKEN) {
    console.warn("MS_TOKEN не найден. Событие не отправлено.");
    return;
  }
  const isPageView = data.eventType === "pageview";

  const searchParams = new URLSearchParams({
    tid: process.env.METRIKA_ID,
    cid: data.clientID,
    t: data.eventType,
    dl: data.pageURL || "",
    ...(isPageView
      ? {
          dr: data.prevPage || "-",
          dt: data.pageTitle || "",
        }
      : {
          ea: data.target || "-",
          ti: data.transaction || "-",
          tr: data.price || "-",
          tcc: data.coupon || "-",
          cu: data.currency || "-",
        }),
    ms: process.env.MS_TOKEN,
  });

  try {
    const response = await server.axios.yandeMetrika.post(
      "collect",
      {},
      { params: searchParams },
    );
    if (response.status !== 200) {
      throw new Error(`Ошибка отправки события: ${response.statusText}`);
    }
    console.log(searchParams);
    console.log("Событие успешно отправлено:", response.data);

    return response.data;
  } catch (error) {
    console.error("Ошибка:", error);
  }
}
