import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import {
  createS3Service,
  getElements,
} from "../../services/s3/create.s3.service";
import { createFileService } from "../../services/file/create.file.service";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { updateFileService } from "../../services/file/update.file.service";
import { getCarCardService } from "../../services/carCard/get.carCard.service";
import { Prisma } from "@prisma/client";
import { managerMiddleware } from "../../middlewares/managerMiddleware";
import { PutObjectCommand, PutObjectRequest } from "@aws-sdk/client-s3";
import { updateListCacheCarCardService } from "../../services/carCard/updateListCache.carCard.service";
import { updateCarCacheCarCardService } from "../../services/carCard/updateCarCache.carCard.service";

export async function fileRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.post(
    "/files",
    {
      preHandler: managerMiddleware,
      schema: {
        body: {
          type: "object",
          properties: {
            key: { type: "string" },
            bucket: { type: "string" },
            fileSize: { type: "string" },
          },
          required: ["key", "bucket", "fileSize"],
        },
      },
    },
    async (request, reply: FastifyReply) => {
      const { key, bucket, fileSize } = request.body as {
        key: string;
        bucket: string;
        fileSize: string;
      };

      const fileModel = await createFileService({
        file_size: +fileSize,
        key: key ?? "",
        bucket: bucket ?? "",
        domain: process.env.S3_DOMAIN ?? "",
      });

      // const res = await getElements();
      // console.log("Elements: ", res);

      return reply.status(201).send(fileModel);
    },
  );

  fastify.post(
    "/files/:fileId/add-to/:carCardId",
    {
      preHandler: managerMiddleware,
      schema: {
        params: {
          type: "object",
          properties: {
            fileId: { type: "string" },
            carCardId: { type: "string" },
          },
          required: ["carCardId", "fileId"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { fileId, carCardId } = request.params as {
        fileId: string;
        carCardId: string;
      };

      const carCard = await getCarCardService(carCardId);
      if (!carCard) {
        return reply.status(404).send({ error: "No carCard" });
      }

      const file = await updateFileService(fileId, {
        carCardId,
      } as Prisma.FileUpdateInput);

      updateListCacheCarCardService().catch((err) => {
        console.error("Ошибка при обработке ключей:", err);
      });

      updateCarCacheCarCardService(carCardId).catch((err) => {
        console.error("Ошибка при обработке ключей:", err);
      });

      return reply.status(200).send(file);
    },
  );
}
