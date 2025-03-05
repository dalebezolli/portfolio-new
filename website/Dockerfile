FROM node:23.8-alpine

WORKDIR /home/node/app
ENV PORT=80
ENV NODE_ENV=production

COPY . .

RUN npm i && npm run build

EXPOSE 80

CMD ["node", "server.js"]
