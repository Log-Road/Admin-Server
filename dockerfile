FROM node:20-alpine AS base

FROM base AS set

ENV NODE_VERSION 20.12.2
ENV NODE_ENV prod

RUN mkdir -p /app
WORKDIR /app

RUN npm install -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm i --no-frozen-lockfile
RUN pnpm prisma generate

FROM set AS build

COPY . .
COPY .env .

RUN cd ..

EXPOSE 8002

CMD [ "pnpm", "start" ]