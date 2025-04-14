import dotenv from "dotenv";
import { bot } from "./bot";
import { getAndSaveWeltCarData } from "./services/dataImport/weltcat";
import { scheduleJob } from "node-schedule";
import { server } from "./server";
import { messageQueue } from "./bull/messageQueue";
import { sentMessageService } from "./services/admin/message/sentMessage.service";
import { updateMessageService } from "./services/admin/message/updateMessage.service";
import { scheduleMessages } from "./services/schedule/scheduleMessages";

dotenv.config();

bot.start().then(() => {
  console.log("Telegram Bot started!");
});

scheduleJob("0 */12 * * *", async () => {
  await getAndSaveWeltCarData();
});

messageQueue.process(async (job) => {
  const messageId: string = job.data.id;
  try {
    // Вызываем сервис отправки сообщения
    await sentMessageService(messageId);
    // Обновляем запись, чтобы отметить, что сообщение отправлено
    await updateMessageService(messageId, { isSend: true });

    console.log(`Сообщение ${messageId} успешно отправлено.`);
  } catch (error) {
    console.error(`Ошибка при отправке сообщения ${messageId}:`, error);
    throw error;
  }
});

scheduleJob("* * * * *", async () => {
  console.log(`Проверка сообщений в ${new Date().toLocaleString()}`);
  await scheduleMessages();
});

server.listen(
  { port: +(process.env.PORT || ""), host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    // getAndSaveWeltCarData();
    console.log(`Server listening at ${address}`);
  },
);
