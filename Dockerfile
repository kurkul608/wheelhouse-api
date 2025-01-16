FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

RUN npm install -g prisma

RUN npx prisma generate

COPY . .

RUN yarn setup-build

EXPOSE 8080

CMD ["sh", "-c", "yarn start"]
