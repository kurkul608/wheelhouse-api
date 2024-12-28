import { FiatAsset } from "@prisma/client";

export function parseFiatAsset(input: string): FiatAsset | null {
  const upperCased = input.toUpperCase();

  if (upperCased in FiatAsset) {
    return FiatAsset[upperCased as keyof typeof FiatAsset];
  }

  return null;
}
