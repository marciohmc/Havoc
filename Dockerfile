# Build Stage
FROM golang:1.22-alpine AS builder

# Instalar todas as dependências necessárias para o Havoc (CGO e Python)
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

# Copia os arquivos do repo forkado
COPY . .

# Preparar ambiente Go
WORKDIR /app/teamserver

# Forçar o download de dependências (Pode falhar se faltar RAM no build)
# Otimização: Se falhar aqui, tente remover o "-x" para logs menores
RUN go mod download -x

# Compilar o Teamserver com otimização de tamanho (remover símbolos de debug)
RUN go build -ldflags="-s -w" -o havoc-teamserver main.go

# Runtime Stage - Usando Alpine para footprint mínimo
FROM alpine:latest
RUN apk add --no-cache python3 py3-pip bash openssl lua5.4

WORKDIR /app
COPY --from=builder /app/teamserver/havoc-teamserver .
COPY --from=builder /app/data ./data
COPY --from=builder /app/profiles ./profiles

# Otimização Crítica para 512MB RAM (Render Free Instance)
ENV GOMEMLIMIT=450MiB
ENV GOGC=40
ENV MALLOC_ARENA_MAX=1

EXPOSE 40056

# Iniciando com o perfil padrão
CMD ["./havoc-teamserver", "server", "--profile", "./profiles/havoc.yaotl", "-v"]
