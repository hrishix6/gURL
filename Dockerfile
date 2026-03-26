FROM node:22-alpine AS frontend

WORKDIR /home/node/app 

RUN npm install -g pnpm@10

RUN chown -R node:node /home/node

USER node 

COPY --chown=node:node ["frontend/package.json", "./frontend/pnpm-lock.yaml", "frontend/tsconfig.app.json","frontend/tsconfig.json", "frontend/angular.json", "frontend/biome.json", "frontend/.postcssrc.json", "./"]

RUN pnpm install --frozen-lockfile

COPY --chown=node:node  frontend/public ./public
COPY --chown=node:node  frontend/src ./src
COPY --chown=node:node  frontend/wailsjs ./wailsjs

RUN pnpm run web-prod

FROM golang:1.24 AS backend

WORKDIR /app 

COPY ./cmd ./cmd

COPY ./internal ./internal

RUN mkdir -p ./internal/assets/static

COPY ./web ./web

COPY ["go.mod", "go.sum", "./"]

COPY --from=frontend /home/node/app/dist/gurl/ ./internal/assets/static/

RUN CGO_ENABLED=1 go build -ldflags '-s -w -extldflags "-static"' -o bin/gurl-web cmd/web/*

FROM scratch

COPY --from=backend /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=backend /app/bin /app/bin

WORKDIR /app

ENV WEB_PORT=80
EXPOSE 80

CMD ["./bin/gurl-web"]

