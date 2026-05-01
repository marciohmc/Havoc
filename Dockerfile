# Build Stage
FROM golang:1.22-alpine AS builder

# Instalar todas as dependências de compilação
RUN apk add --no-cache \
    git \
    build-base \
    python3-dev \
    pkgconfig \
    openssl-dev \
    libffi-dev \
    bash \
    lua5.4-dev

WORKDIR /app

# Copia tudo primeiro para garantir a estrutura
COPY . .

# Entra na pasta do Teamserver
WORKDIR /app/teamserver

# Download de dependências
RUN go mod download

# Compilar o binário
RUN go build -ldflags="-s -w" -o havoc-teamserver main.go

# Runtime Stage
FROM alpine:latest
RUN apk add --no-cache python3 py3-pip bash openssl lua5.4

WORKDIR /app

# Copia apenas o necessário do builder
COPY --from=builder /app/teamserver/havoc-teamserver .
COPY --from=builder /app/data ./data
COPY --from=builder /app/profiles ./profiles

# Variáveis de Ambiente para instâncias de 512MB
ENV GOMEMLIMIT=450MiB
ENV GOGC=40
ENV MALLOC_ARENA_MAX=1

EXPOSE 40056

CMD ["./havoc-teamserver", "server", "--profile", "./profiles/havoc.yaotl", "-v"]
