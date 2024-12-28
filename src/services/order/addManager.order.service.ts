import prisma from "../../prisma";

export const addManagerOrderService = async (
  orderId: string,
  managerId: string,
) => {
  try {
    await prisma.order.update({ where: { id: orderId }, data: { managerId } });
  } catch (error) {
    console.log("Adding manager to order error: ", error);
    throw error;
  }
};
