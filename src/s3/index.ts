import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  endpoint: "https://s3.regru.cloud",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS || "",
    secretAccessKey: process.env.S3_SECRET || "",
  },
});
