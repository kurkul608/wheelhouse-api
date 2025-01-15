// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import S3 from "aws-sdk/clients/s3";

export const s3Client = new S3({
  endpoint: "https://s3.regru.cloud",
  credentials: {
    accessKeyId: process.env.S3_ACCESS || "",
    secretAccessKey: process.env.S3_SECRET || "",
  },
});
