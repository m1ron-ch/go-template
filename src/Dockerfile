# Базовый образ с Go
FROM golang:1.23-alpine AS build

WORKDIR /app

# Копируем исходники и папку vendor (без git!)
COPY go.mod go.sum ./
COPY vendor/ vendor/
COPY . .
COPY configs/ /app/configs/
# COPY ui/ /app/ui/dist

# Используем `vendor` для загрузки зависимостей
ENV GOFLAGS="-mod=vendor"
ENV TZ=Etc/UTC

# Собираем Go-приложение
RUN go build -o /goapp ./cmd/go

# Финальный образ
FROM alpine:3.17
WORKDIR /app
COPY --from=build /goapp /app/goapp
RUN apk add --no-cache ca-certificates
EXPOSE 8080
CMD ["sh", "-c", "sleep 10 && ./goapp"]
