import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../../s3";
import path from "node:path";
import * as fs from "node:fs";

export const createS3Service = async (uploadParams: PutObjectCommand) => {
  try {
    const upld = await s3Client.send(uploadParams);
    console.log("upload data: ", upld);
    return "File uploaded successfully";
  } catch (error) {
    console.log("Error with uploadL ", error);
    throw error;
  }
};
export const getElements = async () => {
  const params = {
    Bucket: process.env.S3_BUCKET ?? "",
  };

  const result = await s3Client.send(
    new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET ?? "" }),
  );

  if (!result.Contents) {
    return [];
  }

  // Возвращаем список имен файлов
  return result.Contents.map((item) => item.Key || "");
};

export const uploadFileToS3 = async () => {
  try {
    const filePath = path.join(__dirname, "TEST_PHOTO.jpg");
    const fileStream = fs.createReadStream(filePath);
    const fileName = "TEST_PHOTO.jpg";

    const uploadParams: PutObjectCommand = new PutObjectCommand({
      Body: fileStream,
      ContentType: "image/jpeg", // Указание типа контента
      Bucket: process.env.S3_BUCKET ?? "",
      Key: `${fileName}`,
      // Body: await file.toBuffer(),
      // ContentType: fileStream.mimetype,
    });

    const response = await createS3Service(uploadParams);
    // console.log(response);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
