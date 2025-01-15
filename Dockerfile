FROM node:22

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn setup-build

EXPOSE 8080

CMD ["yarn", "start"]
