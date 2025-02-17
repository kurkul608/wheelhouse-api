import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getCarBrandsFiltersService } from "../../services/filters/getCarBrandsFilters.service";
import { getCarModelFiltersService } from "../../services/filters/getCarModelFilters.service";

export async function filtersRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/filters/car-brands",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const options = await getCarBrandsFiltersService();

        reply.status(200).send(options);
      } catch (error) {
        fastify.log.error("Error get cars brand filter:", error);
        reply.status(500).send({ error: "Unable to get cars brand filter" });
      }
    },
  );
  fastify.get(
    "/filters/car-models",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const options = await getCarModelFiltersService();

        reply.status(200).send(options);
      } catch (error) {
        fastify.log.error("Error get cars brand filter:", error);
        reply.status(500).send({ error: "Unable to get cars brand filter" });
      }
    },
  );
}
