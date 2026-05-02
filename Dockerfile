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

# Clonar o repositório diretamente para garantir que o código esteja presente
# Isso resolve o erro de "go.mod não encontrado" quando o upload do Render falha
RUN git clone https://github.com/marciohmc/HavocV1.git .

# Localizar dinamicamente onde está o go.mod e compilar
RUN if [ -f "./teamserver/go.mod" ]; then \
        echo "Compilando na pasta teamserver..." && \
        cd teamserver && go mod download && go build -ldflags="-s -w" -o /app/havoc-teamserver main.go; \
    elif [ -f "./go.mod" ]; then \
        echo "Compilando na raiz..." && \
        go mod download && go build -ldflags="-s -w" -o /app/havoc-teamserver main.go; \
    else \
        echo "ERRO: go.mod não encontrado após clone!" && ls -R && exit 1; \
    fi

# Runtime Stage - Alpine para o menor footprint possível
FROM alpine:latest

# Instalar dependências de runtime críticas (Python, Lua, OpenSSL, C++)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    openssl \
    lua5.4 \
    libstdc++ \
    libgcc \
    ca-certificates

WORKDIR /app

# Copia o binário e pastas essenciais do builder
COPY --from=builder /app/havoc-teamserver .
COPY --from=builder /app/data ./data
COPY --from=builder /app/profiles ./profiles

# Garantir permissão de execução
RUN chmod +x ./havoc-teamserver

# Otimização Crítica para instâncias de 512MB RAM
ENV GOMEMLIMIT=450MiB
ENV GOGC=40
ENV MALLOC_ARENA_MAX=1

EXPOSE 40056

# Comando de inicialização com verificação de perfil
CMD ["/bin/sh", "-c", "if [ ! -f './profiles/havoc.yaotl' ]; then echo 'ERRO: Perfil havoc.yaotl nao encontrado!'; exit 1; fi; ./havoc-teamserver server --profile ./profiles/havoc.yaotl -v"]
