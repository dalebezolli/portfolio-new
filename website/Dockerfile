FROM node:23.8-alpine

WORKDIR /home/node/app
ENV PORT=80

COPY . .

RUN npm i

EXPOSE 80

CMD ["npm", "run", "dev"]
