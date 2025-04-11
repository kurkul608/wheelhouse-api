import { File } from "@prisma/client";

export const getFileLink = (file: File) => {
  return `${file.domain}/${file.bucket}/${file.key}`;
};
