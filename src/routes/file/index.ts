import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import multer from "fastify-multer";
import fastifyMultipart from "@fastify/multipart";
import { s3Client } from "../../s3";
import {
  createS3Service,
  getElements,
  uploadFileToS3,
} from "../../services/s3/create.s3.service";
import { createFileService } from "../../services/file/create.file.service";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { PutObjectRequest } from "aws-sdk/clients/s3";
import { updateFileService } from "../../services/file/update.file.service";
import { getCarCardService } from "../../services/carCard/get.carCard.service";
import { Prisma } from "@prisma/client";
import { managerMiddleware } from "../../middlewares/managerMiddleware";

// interface FileRequest extends FastifyRequest {
//   file?: {
//     buffer: Buffer;
//     encoding: string;
//     fieldname: string;
//     mimetype: string;
//     originalname: string;
//     size: number;
//   };
// }

// export const storage = multer.memoryStorage();
// export const upload = multer({ storage });

export async function fileRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);

  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 25 * 1024 * 1024, // 5MB
    },
  });

  fastify.post("/files", async (request, reply: FastifyReply) => {
    console.log("ttt");
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${file.filename}`;

    const uploadParams: PutObjectRequest = {
      Bucket: process.env.S3_BUCKET || "",
      Key: `uploads/${fileName}`,
      Body: await file.toBuffer(),
      ContentType: file.mimetype,
    };

    // await uploadFileToS3();

    // https://s3.regru.cloud/photos/uploads/1735424047084-file
    // https://s3.regru.cloud/${bucket}/${uploadParams.Key}
    // ${domain}/${bucket}/${uploadParams.Key}
    // await uploadFileToS3();

    await createS3Service(uploadParams);

    const fileModel = await createFileService({
      file_size: file.file.bytesRead,
      key: uploadParams.Key ?? "",
      bucket: uploadParams.Bucket ?? "",
      domain: process.env.S3_DOMAIN ?? "",
    });

    const res = await getElements();
    console.log("Elements: ", res);

    return reply.status(201).send(fileModel);
    // return reply.status(201).send("success");
  });

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
      console.log("fileId ", fileId);
      console.log("carCardId ", carCardId);

      const carCard = await getCarCardService(carCardId);
      if (!carCard) {
        return reply.status(404).send({ error: "No carCard" });
      }

      const file = await updateFileService(fileId, {
        carCardId,
      } as Prisma.FileUpdateInput);

      return reply.status(200).send(file);
    },
  );
}
