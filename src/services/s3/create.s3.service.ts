import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { s3Client } from "../../s3";

export const createS3Service = async (uploadParams: PutObjectCommandInput) => {
  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    return "File uploaded successfully";
  } catch (error) {
    console.log(error);
    throw error;
  }
};
