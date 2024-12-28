import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import multer from "fastify-multer";
import fastifyMultipart from "@fastify/multipart";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { s3Client } from "../../s3";
import { createS3Service } from "../../services/s3/create.s3.service";
import { createFileService } from "../../services/file/create.file.service";
import { authMiddleware } from "../../middlewares/authMiddleware";

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
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${file.fieldname}`;

    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.S3_BUCKET,
      Key: `uploads/${fileName}`,
      Body: await file.toBuffer(),
      ContentType: file.mimetype,
    };

    // https://s3.regru.cloud/photos/uploads/1735424047084-file
    // https://s3.regru.cloud/${bucket}/${uploadParams.Key}
    // ${domain}/${bucket}/${uploadParams.Key}
    await createS3Service(uploadParams);

    const fileModel = await createFileService({
      file_size: file.file.bytesRead,
      key: uploadParams.Key ?? "",
      bucket: uploadParams.Bucket ?? "",
      domain: process.env.S3_DOMAIN ?? "",
    });

    return reply.status(201).send(fileModel);
  });
}
