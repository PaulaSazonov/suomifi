FROM node:16 as base

WORKDIR /home/suomifi-poc

COPY package*.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=./dist

RUN npm run build