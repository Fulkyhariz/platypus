FROM golang:1.18-alpine AS builder

WORKDIR /app

COPY go.mod /app

RUN go mod download

COPY . /app

RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

FROM alpine:3 as dev

WORKDIR /app

COPY --from=builder /app/main /app

COPY .env .

EXPOSE 8080

ENTRYPOINT ["./main"]
