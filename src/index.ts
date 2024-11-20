import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv";
import {bot} from "./bot";

dotenv.config();

const server = fastify({ logger: true });

server.register(fastifyCors, {
    origin: true,
});

server.setErrorHandler((error, request, reply) => {
    server.log.error(error);

    reply.status(500).send({
        success: false,
        message: 'Server error.',
    });
});

bot.start().then(() => {
    console.log("Telegram Bot started!");
});

server.listen(
    { port: +(process.env.PORT || ""), host: "0.0.0.0" },
    (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    },
);

