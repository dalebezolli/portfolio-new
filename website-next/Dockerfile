FROM node:18-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

ENV PORT=80
ENV HOSTNAME=0.0.0.0

FROM base AS prod
RUN npm run build
ENV NODE_ENV=production
CMD ["npm", "run", "start"]

FROM base AS dev
CMD ["npm", "run", "dev"]
