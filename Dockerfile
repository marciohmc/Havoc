# Build Stage
FROM golang:1.22-alpine AS builder

# Instalar dependências de compilação essenciais para o Havoc (CGO + Python)
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
COPY . .

# Localizar dinamicamente onde está o go.mod e compilar de forma resiliente
RUN if [ -f "./teamserver/go.mod" ]; then \
        echo "Detectado teamserver em subpasta" && \
        cd teamserver && go mod download && go build -ldflags="-s -w" -o /app/havoc-teamserver main.go; \
    elif [ -f "./go.mod" ]; then \
        echo "Detectado teamserver na raiz" && \
        go mod download && go build -ldflags="-s -w" -o /app/havoc-teamserver main.go; \
    else \
        echo "ERRO: go.mod nao encontrado em /app ou /app/teamserver!" && \
        ls -R /app && \
        exit 1; \
    fi

# Runtime Stage - Alpine para o menor tamanho possível
FROM alpine:latest
RUN apk add --no-cache python3 py3-pip bash openssl lua5.4

WORKDIR /app
COPY --from=builder /app/havoc-teamserver .
COPY --from=builder /app/data ./data
COPY --from=builder /app/profiles ./profiles

# Otimização Crítica para instâncias de 512MB RAM
ENV GOMEMLIMIT=450MiB
ENV GOGC=40
ENV MALLOC_ARENA_MAX=1

EXPOSE 40056

CMD ["./havoc-teamserver", "server", "--profile", "./profiles/havoc.yaotl", "-v"]
