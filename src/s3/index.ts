import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "ru-1",
  endpoint: "https://s3.regru.cloud",
  credentials: {
    accessKeyId: "E94KSL87Q1PKP7JDXZXH",
    secretAccessKey: "ADnePzCsoBZIu9AgeWWITVyPZGkdMxTf7v7gr6Dx",
  },
});
