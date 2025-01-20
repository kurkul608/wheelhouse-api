import dotenv from "dotenv";
import { bot } from "./bot";
import { getAndSaveWeltCarData } from "./services/dataImport/weltcat";
import { scheduleJob } from "node-schedule";
import { server } from "./server";

dotenv.config();

bot.start().then(() => {
  console.log("Telegram Bot started!");
});

// scheduleJob("0 */12 * * *", async () => {
scheduleJob("0 */1 * * *", async () => {
  // scheduleJob("*/1 * * * *", async () => {
  await getAndSaveWeltCarData();
});

server.listen(
  { port: +(process.env.PORT || ""), host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  },
);
