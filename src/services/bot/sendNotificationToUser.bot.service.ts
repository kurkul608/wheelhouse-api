import { getOrder } from "../order/getOrder";
import { bot } from "../../bot";
import { getOrderWithUserAndCars } from "../order/getOrderWithUserAndCars";
import { InlineKeyboard } from "grammy";
import { getMiniAppLink } from "../../utils/getMiniAppLink";

export const sendNotificationToUserBotService = async (orderId: string) => {
  const order = await getOrderWithUserAndCars(orderId);

  if (order && order.user && order.carCards) {
    const carsInlineButtons = order.carCards.map((carCard) => {
      const model = carCard.specifications.find(
        (spec) => spec.field === "model",
      );
      return InlineKeyboard.url(
        model?.value ?? "",
        getMiniAppLink({ carId: carCard.id }),
      );
    });

    const inlineButtons = InlineKeyboard.from([carsInlineButtons]);

    await bot.api.sendMessage(
      order.user.tgId!,
      "Менеджер уже взялся за вашу заявку и скоро свяжется с вами!\n\nАвто, которые вы выбрали:",
      {
        reply_markup: inlineButtons,
      },
    );
  }
};
