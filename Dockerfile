FROM node:22

WORKDIR /app

ARG SQLITE_DATABASE_URL

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

RUN npm install -g prisma

RUN pnpm exec prisma generate
RUN pnpm exec prisma generate --schema=prisma/sqlite.prisma
RUN pnpm exec prisma db push --schema=prisma/sqlite.prisma

COPY . .

RUN pnpm run build

EXPOSE 8080

CMD ["sh", "-c", "pnpm exec prisma db push && pnpm run start"]
