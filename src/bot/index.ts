import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy";
import dotenv from "dotenv";
import { UserRole } from "@prisma/client";
import { createUserService } from "../services/user/create.user.service";

dotenv.config();

export const bot = new Bot(process.env.BOT_TOKEN || "", {
  client: { environment: "test" },
});

bot.command("start", async (ctx) => {
  // const user = await createUserService({
  //   tgId: ctx.from!.id,
  //   username: ctx.from?.username,
  //   firstName: ctx.from?.first_name,
  //   lastName: ctx.from?.last_name,
  //   languageCode: ctx.from?.language_code,
  //   roles: [UserRole.USER],
  // });
  //
  // await ctx.reply("Starting...");
  // await ctx.reply(`Твой id: ${user.id}`);
  const keyboard = new InlineKeyboard().webApp(
    "Some web app",
    "http://zzz.com:3000",
  );
  await ctx.reply("Button", { reply_markup: keyboard });
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
