FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn setup-build

RUN npx prisma generate

EXPOSE 8080

CMD ["sh", "-c", "yarn start"]
