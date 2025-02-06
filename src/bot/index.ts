import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy";
import dotenv from "dotenv";
import { UserRole } from "@prisma/client";
import { createUserService } from "../services/user/create.user.service";
import { getByTgIdUserService } from "../services/user/getByTgId.user.service";
import { getOrderWithUserAndCars } from "../services/order/getOrderWithUserAndCars";
import { addManagerOrderService } from "../services/order/addManager.order.service";
import { generateUserLink } from "../utils/generateUserLink";
import { getMiniAppLink } from "../utils/getMiniAppLink";
import { sendNotificationToUserBotService } from "../services/bot/sendNotificationToUser.bot.service";
import { getAndSaveWeltCarData } from "../services/dataImport/weltcat";

dotenv.config();

export const bot = new Bot(process.env.BOT_TOKEN || "", {
  client: { environment: process.env.LOCAL ? "test" : "prod" },
});

bot.command("start", async (ctx) => {
  try {
    const existUser = await getByTgIdUserService(ctx.from!.id);
    if (!existUser) {
      await createUserService({
        tgId: ctx.from!.id,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
        languageCode: ctx.from?.language_code,
        roles: [UserRole.USER],
      });
    }

    const customEmojiId = "5219767260561823811";
    const messageText = `ZeuseBot — ваш личный помощник в мире эксклюзивных авто\\!

Соприкасаясь с ZeuseBot\\, вы получаете\\:

[🤩](tg://emoji?id=#{customEmojiId}) Удобную современную платформу с премиальными и проверенными авто из любой точки мира\\.

[🤩](tg://emoji?id=#{customEmojiId}) Ежедневные новинки авто со всего мира от наших надежных партнеров и заводов\\.

[🤩](tg://emoji?id=#{customEmojiId}) Понятный и простой интерфейс без рекламы и лишней информации\\.

[🤩](tg://emoji?id=#{customEmojiId}) Мгновенную связь с менеджером — без заполнения форм и ожидания\\.

С ZeuseBot вы становитесь ещё ближе к своей мечте\\! Всего в несколько секунд\\.`;

    const keyboard = new InlineKeyboard().webApp(
      "Каталог Zeuse",
      process.env.MINI_APP_URL || "",
    );
    await ctx.reply(messageText, {
      reply_markup: keyboard,
      parse_mode: "MarkdownV2",
    });
  } catch (error) {
    console.error(error);
    await ctx.reply("Произошла ошибка");
  }
});

bot.command("import", async (ctx) => {
  try {
    const user = await getByTgIdUserService(ctx.from!.id);
    if (!user || !user.roles.includes(UserRole.ADMIN)) {
      await ctx.reply("У вас нет прав на импорт");
      return;
    }
    await ctx.reply("Импорт начался...");
    await getAndSaveWeltCarData();
    await ctx.reply("Импорт завершен");
  } catch (error) {
    console.error(error);
    await ctx.reply("Произошла ошибка");
  }
});

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;

  if (callbackData.startsWith("accept-order")) {
    const orderId = callbackData.replace("accept-order", "");
    const order = await getOrderWithUserAndCars(orderId);
    const manager = await getByTgIdUserService(ctx.from!.id);
    if (!manager?.roles.some((role) => role === "MANAGER")) {
      await ctx.answerCallbackQuery({
        text: `У вас нет роли менеджер и вы не можете принять эту заявку`,
        show_alert: true,
      });

      return;
    }

    await addManagerOrderService(orderId, manager.id);

    const messageId = ctx.callbackQuery.message!.message_id;

    const editMessageText = `Пользователь ${ctx.from.first_name} @${ctx.from.username}\n\nОтветственный менеджер ${manager.firstName} @${manager.username}`;
    const carsInlineButtons =
      order?.carCards.map((carCard) => {
        const model = carCard.specifications.find(
          (spec) => spec.field === "model",
        );
        return InlineKeyboard.url(
          model?.value ?? "",
          getMiniAppLink({ carId: carCard.id }),
        );
      }) ?? [];

    const buttons = InlineKeyboard.from([
      carsInlineButtons,
      [
        InlineKeyboard.url(
          "Ссылка на пользователя",
          generateUserLink(`${order?.user.tgId}`, order?.user.username),
        ),
      ],
    ]);

    console.log(generateUserLink(`${order?.user.tgId}`, order?.user.username));
    await ctx.editMessageText(editMessageText, { reply_markup: buttons });

    await ctx.reply(
      `Менеджер ${ctx.from.first_name} @${ctx.from.username} принял заявку №${orderId}`,
      {
        reply_to_message_id: messageId,
      },
    );

    await sendNotificationToUserBotService(orderId);
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
