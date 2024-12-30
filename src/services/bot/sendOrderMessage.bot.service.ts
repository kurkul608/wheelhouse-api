import { getOrderWithUserAndCars } from "../order/getOrderWithUserAndCars";
import { getMiniAppLink } from "../../utils/getMiniAppLink";
import { InlineKeyboard } from "grammy";
import { bot } from "../../bot";

export const sendOrderMessageBotService = async (orderId: string) => {
  try {
    const order = await getOrderWithUserAndCars(orderId);
    if (!order) {
      throw new Error("order not found");
    }

    const carsInlineButtons = order.carCards.map((carCard) => {
      const model = carCard.specifications.find(
        (spec) => spec.field === "model",
      );
      return InlineKeyboard.url(
        model?.value ?? "",
        getMiniAppLink({ carId: carCard.id }),
      );
    });

    const inlineButtons = InlineKeyboard.from([
      carsInlineButtons,
      [InlineKeyboard.text("Принять заявку ✅", `accept-order${order.id}`)],
    ]);

    const text =
      "Поступила новая заявка\n\nСписок автомобилей находится ниже\n\nЧтобы получить детали о данных пользователя - необходимо принять заявку!";

    const message = await bot.api.sendMessage(
      process.env.MANAGER_CHAT || "",
      text,
      {
        reply_markup: inlineButtons,
      },
    );

    return message;
  } catch (error) {
    console.log("Send order message error: ", error);
    throw error;
  }
};
