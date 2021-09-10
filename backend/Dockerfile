FROM node:16 as builder

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn run build

RUN ls

FROM node:16-alpine as prod

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --prod

RUN ls

COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/migrations ./migrations

EXPOSE 8800

CMD ["node", "build/index.js"]
