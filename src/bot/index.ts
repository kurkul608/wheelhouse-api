import {
  Bot,
  GrammyError,
  HttpError,
  InlineKeyboard,
  InputFile,
  Keyboard,
} from "grammy";
import dotenv from "dotenv";
import { Prisma, UserRole, Video } from "@prisma/client";
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
import { openaiClient } from "../openai";
import { deleteEmptyCarCardService } from "../services/carCard/deleteEmpty.carCard.service";
import { updateCarCardBrands } from "../services/admin/updateCarCardBrands";
import { removeCarCardDuplicatesService } from "../services/duplicates/removeCarCardDuplicates.service";
import { updateListCacheCarCardService } from "../services/carCard/updateListCache.carCard.service";
import { getRefService } from "../services/ref/get.refService";
import { updateUserService } from "../services/user/updateUser.service";
import { sendEventToYandexMetrika } from "../services/sendMetrika/sendMetrika.service";
import { clickRefService } from "../services/ref/click.refService";
import { getAllExternalManagerCarService } from "../services/manager/car/getAllExternalActive.manager.car.service";

dotenv.config();

export const bot = new Bot(process.env.BOT_TOKEN || "", {
  client: { environment: process.env.LOCAL ? "test" : "prod" },
});

function parseQuery(queryStr: string, key: string) {
  if (!queryStr) return null;
  // Если строка выглядит как "key1=value1&key2=value2", используем URLSearchParams
  const params = new URLSearchParams(queryStr);
  return params.get(key);
}

bot.use(async (ctx, next) => {
  if (ctx.chat?.type !== "private") return;
  await next();
});

bot.command("start", async (ctx) => {
  try {
    const existUser = await getByTgIdUserService(ctx.from!.id);
    // if (!existUser) {
    //   await createUserService({
    //     tgId: ctx.from!.id,
    //     username: ctx.from?.username,
    //     firstName: ctx.from?.first_name,
    //     lastName: ctx.from?.last_name,
    //     languageCode: ctx.from?.language_code,
    //     roles: [UserRole.USER],
    //   });
    // }

    const text = ctx.message?.text || "";
    const parts = text.split(" ");
    const queryString = parts.length > 1 ? parts.slice(1).join(" ") : "";

    const clientId = parseQuery(queryString, "id");
    const refId = parseQuery(queryString, "refId");

    console.log(refId);

    if (refId) {
      clickRefService(refId).catch((error) => {
        console.error(error);
      });
    }

    if (!existUser) {
      if (refId) {
        getRefService(refId)
          .then((ref) => {
            if (ref) {
              createUserService({
                tgId: ctx.from!.id,
                username: ctx.from?.username,
                firstName: ctx.from?.first_name,
                lastName: ctx.from?.last_name,
                languageCode: ctx.from?.language_code,
                roles: [UserRole.USER],
                refId: ref.id,
                clientId,
              } as unknown as Prisma.UserCreateInput).catch(async (error) => {
                console.error(error);
                await ctx.reply("Произошла ошибка");
              });
            } else {
              createUserService({
                tgId: ctx.from!.id,
                username: ctx.from?.username,
                firstName: ctx.from?.first_name,
                lastName: ctx.from?.last_name,
                languageCode: ctx.from?.language_code,
                roles: [UserRole.USER],
                clientId,
              }).catch(async (error) => {
                console.error(error);
                await ctx.reply("Произошла ошибка");
              });
            }
          })
          .catch(() => {
            createUserService({
              tgId: ctx.from!.id,
              username: ctx.from?.username,
              firstName: ctx.from?.first_name,
              lastName: ctx.from?.last_name,
              languageCode: ctx.from?.language_code,
              roles: [UserRole.USER],
              clientId,
            }).catch(async (error) => {
              console.error(error);
              await ctx.reply("Произошла ошибка");
            });
          });
      } else {
        createUserService({
          tgId: ctx.from!.id,
          username: ctx.from?.username,
          firstName: ctx.from?.first_name,
          lastName: ctx.from?.last_name,
          languageCode: ctx.from?.language_code,
          roles: [UserRole.USER],
          clientId,
        }).catch(async (error) => {
          console.error(error);
          await ctx.reply("Произошла ошибка");
        });
      }
    }

    if (existUser && clientId && !existUser.clientId) {
      updateUserService(existUser.id, { clientId }).catch(async (error) => {
        console.error(error);
        await ctx.reply("Произошла ошибка");
      });
    }

    if (clientId) {
      sendEventToYandexMetrika({
        eventType: "pageview",
        clientID: clientId,
        pageTitle: "Команда нажата /start с параметром clientId",
        pageURL: `${process.env.MINI_APP_URL}/bot-command/start`,
        prevPage: "",
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
    let startVideoFile: null | Video = null;
    try {
      startVideoFile = await getByFilenameVideoService("IMG_9760.MP4");
    } catch (error) {
      console.error(error);
    }
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

    setTimeout(async () => {
      try {
        await getAndSaveWeltCarData();
        await ctx.reply("Импорт завершен");
      } catch (error) {
        console.error(error);
        await ctx.reply("Произошла ошибка во время импорта");
      }
    }, 0);
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

    if (ctx.from && !ctx.from.is_bot) {
      getByTgIdUserService(ctx.from.id).then((userData) => {
        if (userData && userData.clientId) {
          sendEventToYandexMetrika({
            eventType: "pageview",
            clientID: userData.clientId,
            pageTitle: "Команда нажата /channel",
            pageURL: `${process.env.MINI_APP_URL}/bot-command/chanel`,
            prevPage: "",
          });
        }
      });
    }
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

    if (ctx.from && !ctx.from.is_bot) {
      getByTgIdUserService(ctx.from.id).then((userData) => {
        if (userData && userData.clientId) {
          sendEventToYandexMetrika({
            eventType: "pageview",
            clientID: userData.clientId,
            pageTitle: "Команда нажата /catalog",
            pageURL: `${process.env.MINI_APP_URL}/bot-command/catalog`,
            prevPage: "",
          });
        }
      });
    }
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
    const aboutText = `
ПОЧЕМУ ZEUSE — ЭТО ВЫБОР, КОТОРЫЙ ВЫ ЗАСЛУЖИВАЕТЕ?

• Мы слеплены из одного теста. ZEUSE — это бренд, который разделяет вашу страсть к автомобилям. Мы создаем уникальный опыт для тех, кто ценит качество, скорость и эмоции.

• Эксклюзивные авто со всего мира: доставляем авто в любой комплектации через проверенных партнеров, как для физ.лиц, так и для юр.лиц с НДС. Каждая модель проходит тщательную проверку.

• Широкий выбор — от лютых спорткаров до вездеходов, от экзотики до классики — найдем авто под ваш стиль.

• Надежность на каждом этапе: проверенные автомобили,

• Прозрачность: детальные отчеты с фото на всех этапах, чтобы вы знали, где находится ваш авто в любой момент.

• Сопровождение 24/7. Берем на себя всё: от заказа до доставки. Всегда на связи, чтобы сохранить ваши нервы.

• Документы под ключ. Вам нужно приехать всего дважды: подписать договор и забрать авто.

• Эмоции за рулем: мы доставляем не просто машины, а стиль жизни, комфорт и адреналин.

«Сложно, когда есть выбор, глупо, когда его нет»`;

    const existPhotoFile = await getByFilenameVideoService(
      "photo_2025-02-11 08.58.39.jpeg",
    );
    const photoDir = path.join(
      __dirname,
      "../../video/photo_2025-02-11 08.58.39.jpeg",
    );
    const photoFile = new InputFile(photoDir);
    const message = await ctx.replyWithPhoto(
      existPhotoFile ? existPhotoFile.fileId : photoFile,
      {
        caption: aboutText,
        reply_markup: keyboard,
      },
    );

    if (message.photo[0].file_id && !existPhotoFile) {
      await createVideoService({
        fileId: message.photo[0].file_id,
        filename: "photo_2025-02-11 08.58.39.jpeg",
      });
    }

    if (ctx.from && !ctx.from.is_bot) {
      getByTgIdUserService(ctx.from.id).then((userData) => {
        if (userData && userData.clientId) {
          sendEventToYandexMetrika({
            eventType: "pageview",
            clientID: userData.clientId,
            pageTitle: "Команда нажата /about",
            pageURL: `${process.env.MINI_APP_URL}/bot-command/about`,
            prevPage: "",
          });
        }
      });
    }
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

    if (ctx.from && !ctx.from.is_bot) {
      getByTgIdUserService(ctx.from.id).then((userData) => {
        if (userData && userData.clientId) {
          sendEventToYandexMetrika({
            eventType: "pageview",
            clientID: userData.clientId,
            pageTitle: "Команда нажата /site",
            pageURL: `${process.env.MINI_APP_URL}/bot-command/site`,
            prevPage: "",
          });
        }
      });
    }
  } catch (error) {
    console.error(error);
    await ctx.reply("Произошла ошибка");
  }
});

// bot.command("test", async (ctx) => {
//   try {
//     const data = await getAllExternalManagerCarService();
//     console.log(data);
//     await ctx.reply("done");
//   } catch (err) {
//     console.error(err);
//   }
// });
bot.command("gpttest", async (ctx) => {
  try {
    const user = await getByTgIdUserService(ctx.from!.id);
    if (!user || !user.roles.includes(UserRole.ADMIN)) {
      await ctx.reply("У вас нет прав на импорт");
      return;
    }
    await ctx.reply("Начал проверку GPT");
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "Ping" }],
    });

    await ctx.reply("GPT доступен");
  } catch (error) {
    await ctx.reply("Ошибка при проверке доступности ChatGPT:");
    console.error("Ошибка при проверке доступности ChatGPT:", error);
    return false;
  }
});
bot.command("deleteempty", async (ctx) => {
  try {
    const user = await getByTgIdUserService(ctx.from!.id);
    if (!user || !user.roles.includes(UserRole.ADMIN)) {
      await ctx.reply("У вас нет прав на импорт");
      return;
    }
    await ctx.reply("Начал удалять пустые авто");
    await deleteEmptyCarCardService();

    await ctx.reply("Закончил удалять пустые авто");
  } catch (error) {
    await ctx.reply("Ошибка при удалении пустых авто:");
    console.error("Delete empty autos error:", error);
    return false;
  }
});
bot.command("exclusive", async (ctx) => {
  try {
    const keyboard = new InlineKeyboard().url(
      "EXCLUSIVE ПОДБОР",
      "https://wa.me/message/JO7FR2I6DBYAC1",
    );

    const exclusiveText = `Если не нашли в нашем каталоге ту, от которой кровь закипает внутри и страстно хочется, то напишите менеджеру, сделаем индивидуальный подбор.

Можем доставить вашу эксклюзивную автомобильную мечту прямо с завода!
`;

    const existVideoFile = await getByFilenameVideoService("IMG_0362.MP4");
    const videoDir = path.join(__dirname, "../../video/IMG_0362.MP4");
    const videoFile = new InputFile(videoDir);
    const message = await ctx.replyWithVideo(
      existVideoFile ? existVideoFile.fileId : videoFile,
      {
        caption: exclusiveText,
        reply_markup: keyboard,
      },
    );

    if (message.video.file_id && !existVideoFile) {
      await createVideoService({
        fileId: message.video.file_id,
        filename: "IMG_0362.MP4",
      });
    }

    if (ctx.from && !ctx.from.is_bot) {
      getByTgIdUserService(ctx.from.id).then((userData) => {
        if (userData && userData.clientId) {
          sendEventToYandexMetrika({
            eventType: "pageview",
            clientID: userData.clientId,
            pageTitle: "Команда нажата /exclusive",
            pageURL: `${process.env.MINI_APP_URL}/bot-command/exclusive`,
            prevPage: "",
          });
        }
      });
    }
  } catch (error) {
    await ctx.reply("Ошибка при удалении пустых авто:");
    console.error("Delete empty autos error:", error);
    return false;
  }
});

bot.command("contact", async (ctx) => {
  try {
    const user = await getByTgIdUserService(ctx.from!.id);
    if (!user || !user.roles.includes(UserRole.SUPER_ADMIN)) {
      await ctx.reply("У вас нет прав на этот функционал");
      return;
    }

    const keyboard = new Keyboard()
      .requestContact("📞 Поделиться номером")
      .resized();
    await ctx.reply("Нажмите кнопку ниже, чтобы поделиться номером:", {
      reply_markup: keyboard,
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    await ctx.reply("Ошибка при удалении пустых авто:");
    console.error("Delete empty autos error:", error);
    return false;
  }
});

bot.command("updatebrands", async (ctx) => {
  try {
    const user = await getByTgIdUserService(ctx.from!.id);
    if (!user || !user.roles.includes(UserRole.SUPER_ADMIN)) {
      await ctx.reply("У вас нет прав на этот функционал");
      return;
    }

    await ctx.reply("Начат процесс обновления автомобилей");
    updateCarCardBrands()
      .then(async () => {
        await ctx.reply("Процесс обновления авто успешно окончен");
      })
      .catch(async () => {
        await ctx.reply("Произошла ошибка");
      });
  } catch (error) {
    console.error("updating data error: ", error);
    await ctx.reply("Произошла ошибка");
  }
});

bot.command("updatecache", async (ctx) => {
  try {
    const user = await getByTgIdUserService(ctx.from!.id);
    if (!user || !user.roles.includes(UserRole.SUPER_ADMIN)) {
      await ctx.reply("У вас нет прав на этот функционал");
      return;
    }

    await ctx.reply("Начат процесс обновления кэша");
    updateListCacheCarCardService()
      .then(async () => {
        await ctx.reply("Процесс обновления кэша");
      })
      .catch(async () => {
        await ctx.reply("Произошла ошибка");
      });
  } catch (error) {
    console.error("updating data error: ", error);
    await ctx.reply("Произошла ошибка");
  }
});

bot.command("duplicates", async (ctx) => {
  try {
    const user = await getByTgIdUserService(ctx.from!.id);
    if (!user || !user.roles.includes(UserRole.SUPER_ADMIN)) {
      await ctx.reply("У вас нет прав на этот функционал");
      return;
    }

    await ctx.reply("Начат процесс удаления дубликатов");
    removeCarCardDuplicatesService()
      .then(async () => {
        await ctx.reply("Процесс удаления дубликатов успешно окончен");
        updateListCacheCarCardService().catch(async () => {
          await ctx.reply("Произошла ошибка во время обновления списков");
        });
      })
      .catch(async () => {
        await ctx.reply("Произошла ошибка во время обновления дубликатов");
      });
  } catch (error) {
    console.error("updating data error: ", error);
    await ctx.reply("Произошла ошибка во время обновления дубликатов");
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

    const editMessageText = `Пользователь ${order?.user.firstName ?? ""} ${order?.user.lastName ?? ""} @${order?.user.username ?? ""}\n\nОтветственный менеджер ${manager.firstName} @${manager.username}
    Номер телефона пользавтеля -   \`${order?.user.phoneNumber}\`
    
    ЕСЛИ КНОПКА ОТКРЫТЬ ПОЛЬЗОВАТЕЛЯ НЕ РАБОТАЕТ, ТО НУЖНО СВЯЗАТЬСЯ С КЛИНЕТОМ ПРИ ПОМОЩИ ТЕЛЕФОНА
    ЧТОБЫ СКОПИРОВАТЬ НОМЕР ТЕЛЕФОНА НАЖМИТЕ НА НЕГО!`;

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
    const escapedText = editMessageText.replace(/_/g, "\\_");

    await ctx.editMessageText(escapedText, {
      reply_markup: buttons,
      parse_mode: "Markdown",
    });

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
