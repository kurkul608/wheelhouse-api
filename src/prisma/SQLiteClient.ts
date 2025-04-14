import { PrismaClient } from "@prisma/sqlite";

const SQLiteClient = new PrismaClient();

async function initSQLite() {
  try {
    const result = await SQLiteClient.$queryRaw`PRAGMA journal_mode=WAL;`;
    console.log("SQLite настроен в режиме WAL. Результат:", result);
  } catch (error) {
    console.error("Ошибка установки WAL:", error);
  }
}

initSQLite();

export { SQLiteClient };
