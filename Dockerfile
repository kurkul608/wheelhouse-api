FROM node:22

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install

RUN npm install -g prisma

RUN npx prisma generate

COPY . .

RUN #npx prisma db push

RUN yarn build

EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push && yarn start"]
