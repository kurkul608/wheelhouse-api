import prisma from "../../prisma";

export const removePhotoFromCarCard = async (
  carCardId: string,
  fileId: string,
) => {
  try {
    const carCard = await prisma.carCard.findUnique({
      where: { id: carCardId },
      include: { photos: true },
    });

    if (!carCard) {
      throw new Error("CarCard not found");
    }

    const photoExists = carCard.photos.some((photo) => photo.id === fileId);

    if (!photoExists) {
      throw new Error("File is not associated with this CarCard");
    }

    await prisma.carCard.update({
      where: { id: carCardId },
      data: {
        photos: {
          disconnect: { id: fileId },
        },
      },
    });

    return {
      success: true,
      message: "File disconnected from CarCard successfully",
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to disconnect file from CarCard");
  }
};
