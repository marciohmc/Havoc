# Build Stage
FROM golang:1.22-alpine AS builder

# Instalar dependências de compilação essenciais (CGO + Python)
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

# 1. Clonar o repositório OFICIAL do Havoc
RUN git clone https://github.com/HavocFramework/Havoc.git .

# 2. Compilar o Teamserver seguindo a lógica do Makefile oficial
# Nota: Ignoramos o ./teamserver/Install.sh pois ele tenta baixar binários fixos que falham no Alpine.
RUN cd teamserver && \
    go mod download && \
    go build -ldflags="-s -w -X 'github.com/HavocFramework/Havoc/teamserver/cmd.VersionCommit=$(git rev-parse HEAD)'" -o /app/havoc-teamserver main.go

# Runtime Stage
FROM alpine:latest

# Dependências de runtime essenciais (Incluindo compiladores para o Demon)
RUN apk add --no-cache \
    python3 \
    bash \
    openssl \
    lua5.4 \
    libstdc++ \
    libgcc \
    ca-certificates \
    sqlite-libs \
    gcompat \
    i686-w64-mingw32-gcc \
    nasm

WORKDIR /app

# Copia TUDO do builder para manter a estrutura (data, profiles, scripts)
COPY --from=builder /app /app

RUN chmod +x ./havoc-teamserver

ENV GOMEMLIMIT=450MiB
EXPOSE 40056

# INICIALIZAÇÃO: Corrige os caminhos no perfil ANTES de dar o boot
CMD ["/bin/sh", "-c", " \
    PROFILE=$(find . -name 'havoc.yaotl' -print -quit); \
    if [ -n \"$PROFILE\" ]; then \
        echo \"Ajustando compiladores em $PROFILE...\"; \
        sed -i 's|Compiler64.*=.*|Compiler64 = \"/usr/bin/x86_64-w64-mingw32-gcc\"|g' \"$PROFILE\"; \
        sed -i 's|Compiler86.*=.*|Compiler86 = \"/usr/bin/i686-w64-mingw32-gcc\"|g' \"$PROFILE\"; \
        sed -i 's|Nasm.*=.*|Nasm = \"/usr/bin/nasm\"|g' \"$PROFILE\"; \
    fi; \
    ./havoc-teamserver server --profile \"$PROFILE\" -v \
"]
