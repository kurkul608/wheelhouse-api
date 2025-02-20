import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { openaiClient } from "../../openai";
import { Prisma } from "@prisma/client";

const CarField = z.object({
  fieldName: z.string(),
  field: z.string(),
  value: z.string(),
});

const CarSchema = z.object({
  data: z.array(
    z.object({
      fieldName: z.string(),
      field: z.string(),
      value: z.string(),
    }),
  ),
  description: z.string(),
});

export const generateCarOpenaiService = async (
  carDescription: string,
): Promise<{
  data: Omit<Prisma.SpecificationCreateManyInput, "carCardId">[];
  description: string;
} | null> => {
  try {
    const prompt = `
Я получил JSON с описанием автомобиля на английском и немецком языках:
${JSON.stringify(carDescription)}

Проанализируй это описание и заполни следующую схему JSON. Если данные отсутствуют, оставь пустое значение в поле "value". Возвращай только JSON, без лишнего текста.

[
  { "fieldName": "Цвет экстерьера", "field": "color_ext", "value": "" },
  { "fieldName": "Цвет интерьера", "field": "color_int", "value": "" },
  { "fieldName": "Модель", "field": "model", "value": "" },
  { "fieldName": "Спецификация", "field": "specification", "value": "" },
  { "fieldName": "Год выпуска", "field": "year", "value": "" },
  { "fieldName": "VIN номер", "field": "vin", "value": "" },
  { "fieldName": "Поколение", "field": "generation", "value": "" },
  { "fieldName": "Кузов", "field": "body", "value": "" },
  { "fieldName": "Двигатель", "field": "engine", "value": "" },
  { "fieldName": "Налог", "field": "tax", "value": "" },
  { "fieldName": "Коробка", "field": "transmission", "value": "" },
  { "fieldName": "Привод", "field": "drive", "value": "" }
]
а в description занеси переведнное на русский язык опсиние, если оно пристутсвовало у автомобиля. Ничего придумывать нельяза только факты из описания. Можешь использовать html теги для форматирования текста, чтобы он был был читаем на мобильном устройстве.
В случае, если в оригинальном тексте ссылются на документы - не нужно этого делать
Добавь обязательно текст о том, что если пользователь хочет узнать больше об автомобиле - ему нужно нажать на кнпоку звязи с менеджером
обращение должно быть уважительным
Обращаться к пользователя только на Вы и никак нельзя на Ты
Текст нужно писать тоже от множественного числа, а не от единственного.
например писать можно - "Мы хотим вам представить новый автомобиль" и нельзя писать - "Я хочу вам представить новый автомобиль"
Нужно писать текст с учектом того, что он будет читаться на мобильном устройстве. Нужно делать переносы строки, чтобы это было читаемо с телефона пользователем, можешь использовать html теги
`;

    const completion = await openaiClient.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(CarSchema, "car_data"),
    });

    const carData = completion.choices[0].message;

    if (carData.refusal) {
      console.log("Модель отказалась отвечать:", carData.refusal);
      return null;
    }

    return carData.parsed;
  } catch (error) {
    console.error(
      "Ошибка при анализе данных автомобиля:",
      (error as { message: string }).message,
    );
    throw error;
  }
};
