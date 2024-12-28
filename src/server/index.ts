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

export const server = fastify({ logger: true });

server.register(fastifyCors, {
  origin: true,
});

server.register(fastifyAxios, {
  clients: {
    clientWeltCar: { baseURL: process.env.WELT_CAR_BASE_URL },
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
