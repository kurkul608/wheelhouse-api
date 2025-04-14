import { DateTime } from "luxon";
import { prismaMongoClient } from "../../prisma";
import { periodMessageQueue } from "../../bull/periodMessageQueue";
import { MessageStatus, MessageType } from "@prisma/client";

function computeNextRunTime(
  start: DateTime,
  periodType: string,
  now: DateTime,
): DateTime {
  let nextTime = start;
  while (nextTime <= now) {
    switch (periodType) {
      case "EVERY_HOUR":
        nextTime = nextTime.plus({ hours: 1 });
        break;
      case "EVERY_DAY":
        nextTime = nextTime.plus({ days: 1 });
        break;
      case "EVERY_WEEK":
        nextTime = nextTime.plus({ days: 7 });
        break;
      case "EVERY_MONTH":
        nextTime = nextTime.plus({ months: 1 });
        break;
      default:
        throw new Error(`Неподдерживаемый periodType: ${periodType}`);
    }
  }
  return nextTime;
}

export const schedulePeriodMessages = async () => {
  const now = DateTime.now();
  const oneHourLater = now.plus({ hours: 1 });

  const messages = await prismaMongoClient.message.findMany({
    where: {
      status: MessageStatus.ACTIVE,
      type: MessageType.PERIOD,
    },
  });

  console.log(`Найдено периодичных сообщений: ${messages.length}`);

  for (const message of messages) {
    if (message.startTime && message.periodType) {
      const startTime = DateTime.fromJSDate(new Date(message.startTime));
      const nextRunTime = computeNextRunTime(
        startTime,
        message.periodType,
        now,
      );

      if (nextRunTime >= now && nextRunTime <= oneHourLater) {
        const jobId = `${message.id}-${nextRunTime.toMillis()}`;

        const existingJob = await periodMessageQueue.getJob(jobId);
        if (existingJob) {
          console.log(`Задание с id ${jobId} уже запланировано.`);
          continue;
        }

        const delay = nextRunTime.diff(now).toMillis();
        console.log(`Планируем задание ${jobId} с задержкой ${delay} мс`);

        await periodMessageQueue.add({ id: message.id }, { delay, jobId });
      }
    }
  }
};
