FROM node:20-alpine AS base

FROM base AS set

ENV NODE_VERSION 20.12.2

RUN mkdir -p /app
WORKDIR /app

RUN npm install -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .env ./

RUN pnpm i --no-frozen-lockfile

FROM set AS build

COPY . .
COPY .env .
RUN export NODE_ENV=prod
RUN cd ..

EXPOSE 8002

CMD [ "node", "main.js" ]