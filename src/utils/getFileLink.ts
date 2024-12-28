import { Prisma } from "@prisma/client";

export const getFileLink = (file: Prisma.FileGetPayload<any>) => {
  return `${file.domain}/${file.bucket}/${file.key}`;
};
