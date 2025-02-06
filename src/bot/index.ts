import { Bot, GrammyError, HttpError, InlineKeyboard, InputFile } from "grammy";
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
import path from "node:path";
import { getByFilenameVideoService } from "../services/video/getByFilename.video.service";
import { createVideoService } from "../services/video/create.video.service";

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
    const messageText = `ZeuseBot — ваш личный помощник в мире эксклюзивных авто!

Соприкасаясь с ZeuseBot, вы получаете:

 Удобную современную платформу с премиальными и проверенными авто из любой точки мира.

 Ежедневные новинки авто со всего мира от наших надежных партнеров и заводов.

 Понятный и простой интерфейс без рекламы и лишней информации.

 Мгновенную связь с менеджером — без заполнения форм и ожидания.

С ZeuseBot вы становитесь ещё ближе к своей мечте! Всего в несколько секунд.`;

    const keyboard = new InlineKeyboard().webApp(
      "Каталог Zeuse",
      process.env.MINI_APP_URL || "",
    );
    const startVideoFile = await getByFilenameVideoService("IMG_9760.MP4");
    const videoDir = path.join(__dirname, "../../video/IMG_9760.MP4");
    const videoFile = new InputFile(videoDir);
    const message = await ctx.replyWithVideo(
      startVideoFile ? startVideoFile.fileId : videoFile,
      {
        caption: messageText,
        reply_markup: keyboard,
      },
    );
    if (message.video.file_id && !startVideoFile) {
      await createVideoService({
        fileId: message.video.file_id,
        filename: "IMG_9760.MP4",
      });
    }
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

bot.command("channel", async (ctx) => {
  try {
    const keyboard = new InlineKeyboard().url(
      "TG Канал",
      "t.me/+8SYGKFeWxvpjY2Ey",
    );
    await ctx.reply("Нажми на кнопку для перехода в TG канал", {
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error(error);
    await ctx.reply("Произошла ошибка");
  }
});

bot.command("catalog", async (ctx) => {
  try {
    const keyboard = new InlineKeyboard().webApp(
      "Каталог Zeuse",
      process.env.MINI_APP_URL || "",
    );
    await ctx.reply("Нажми на кнопку для перехода в каталог Zeuse", {
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error(error);
    await ctx.reply("Произошла ошибка");
  }
});

bot.command("about", async (ctx) => {
  try {
    const keyboard = new InlineKeyboard()
      .webApp("Каталог Zeuse", process.env.MINI_APP_URL || "")
      .row()
      .url("Веб сайт Zeuse", "https://zeuse.ru/")
      .row()
      .url("TG Канал", "t.me/+8SYGKFeWxvpjY2Ey");
    const aboutText = `ZEUSE — это бренд, который разделяет вашу страсть к автомобилям. Мы создаем уникальный опыт для тех, кто ценит качество, скорость и эмоции.  

Почему Вы можете доверять нам?  

1. Эксклюзивные авто из любой точки мира. Доставляем авто в любой комплектации через проверенных партнеров, как для физ.лиц, так и для юр.лиц с НДС. Каждая модель проходит тщательную проверку.

2. Широкий выбор. От лютых спорткаров до вездеходов, от экзотики до классики — найдем авто под ваш стиль.

3. Сопровождение 24/7. Берем на себя всё: от заказа до доставки. Фото, проверки, связь — мы с вами на каждом этапе.

4. Документы под ключ. Вам нужно приехать всего дважды: подписать договор и забрать авто.

5. Эмоции, которые вдохновляют. Если вы живете ради драйва и новых впечатлений, вы — наш клиент.

«Сложно, когда есть выбор, глупо, когда его нет»`;

    const existVideoFile = await getByFilenameVideoService("IMG_9767.MOV");
    const videoDir = path.join(__dirname, "../../video/IMG_9767.MOV");
    const videoFile = new InputFile(videoDir);
    await ctx.replyWithVideo(
      existVideoFile ? existVideoFile.fileId : videoFile,
      {
        caption: aboutText,
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    console.error(error);
    await ctx.reply("Произошла ошибка");
  }
});

bot.command("site", async (ctx) => {
  try {
    const keyboard = new InlineKeyboard().url(
      "Веб сайт Zeuse",
      "https://zeuse.ru/",
    );
    await ctx.reply("Нажми на кнопку для перехода на веб сайт", {
      reply_markup: keyboard,
    });
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
