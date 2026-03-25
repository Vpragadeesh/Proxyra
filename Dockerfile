FROM rust:latest AS builder

WORKDIR /app/backend

COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/src ./src

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/backend/target/release/proxyra-backend ./proxyra-backend

ENV ROCKET_ADDRESS=0.0.0.0
ENV PORT=10000

EXPOSE 10000

CMD ["./proxyra-backend"]
