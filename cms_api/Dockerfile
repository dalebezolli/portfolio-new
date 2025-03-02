FROM golang:1.24

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN make

EXPOSE 9000

CMD ["./dist/server"]
