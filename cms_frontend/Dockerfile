FROM node:23.8-alpine

WORKDIR /home/node/app
ENV PORT=8800

COPY . .

RUN npm i

EXPOSE 8800

CMD ["npm", "run", "dev"]
