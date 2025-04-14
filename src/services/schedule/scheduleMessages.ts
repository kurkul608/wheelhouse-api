import { prismaMongoClient } from "../../prisma";
import { Message, MessageType, MessageStatus } from "@prisma/client";
import { messageQueue } from "../../bull/messageQueue";
import { DateTime } from "luxon";

export async function scheduleMessages(): Promise<void> {
  const now = DateTime.utc();
  const oneHourLater = now.plus({ hours: 1 });

  try {
    const messages: Message[] = await prismaMongoClient.message.findMany({
      where: {
        startTime: {
          gte: now.toJSDate(),
          lt: oneHourLater.toJSDate(),
        },
        isSend: false,
        type: MessageType.ONCE,
        status: MessageStatus.ACTIVE,
      },
    });

    for (const message of messages) {
      const existingJob = await messageQueue.getJob(message.id);
      if (!existingJob) {
        let delay = message.startTime
          ? DateTime.fromJSDate(message.startTime).toMillis() - now.toMillis()
          : 0;
        delay = Math.max(delay, 0);
        await messageQueue.add(
          { id: message.id },
          { delay, jobId: message.id },
        );
        console.log(
          `Задача для сообщения ${message.id} добавлена в очередь с задержкой ${delay} мс.`,
        );
      } else {
        console.log(
          `Задача для сообщения ${message.id} уже находится в очереди.`,
        );
      }
    }
  } catch (error) {
    console.error("Ошибка при планировании сообщений:", error);
  }
}
