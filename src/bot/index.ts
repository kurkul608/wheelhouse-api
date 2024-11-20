import {Bot, GrammyError, HttpError} from "grammy";
import dotenv from "dotenv";

dotenv.config();

export const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", async (ctx) => {
    await ctx.reply("Starting...");
})

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