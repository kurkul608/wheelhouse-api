import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyAxios from "fastify-axios";
import { carCardRoutes } from "../routes/carCard";
import { userRoutes } from "../routes/user";
import { bucketRoutes } from "../routes/bucket";
import { wishlistRoutes } from "../routes/wishlist";
import { orderRoutes } from "../routes/oreder";
import { fileRoutes } from "../routes/file";
import multer from "fastify-multer";
import { managerCarsRoutes } from "../routes/manager/cars";
import { managerSpecificationRoutes } from "../routes/manager/specification";
import { adminUsersRoutes } from "../routes/admin/users";
import { managerPublicRoutes } from "../routes/manager/public";
import { filtersRoutes } from "../routes/filters";
import { adminRefRoutes } from "../routes/admin/ref";
import { adminTemplateRoutes } from "../routes/admin/messageTemplate";

export const server = fastify({ logger: true });

server.register(fastifyCors, {
  origin: true,
});

server.register(fastifyAxios, {
  clients: {
    clientWeltCar: { baseURL: process.env.WELT_CAR_BASE_URL },
    yandeMetrika: { baseURL: "https://mc.yandex.ru/" },
  },
});

server.setErrorHandler((error, request, reply) => {
  server.log.error(error);

  reply.status(500).send({
    success: false,
    message: "Server error.",
  });
});

server.register(carCardRoutes);
server.register(userRoutes);
server.register(bucketRoutes);
server.register(wishlistRoutes);
server.register(orderRoutes);
server.register(fileRoutes);
server.register(managerCarsRoutes);
server.register(managerSpecificationRoutes);
server.register(adminUsersRoutes);
server.register(managerPublicRoutes);
server.register(filtersRoutes);
server.register(adminRefRoutes);
server.register(adminTemplateRoutes);
