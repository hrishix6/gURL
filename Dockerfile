FROM node:22-alpine AS frontend

WORKDIR /home/node/app 

RUN npm install -g pnpm@10

RUN chown -R node:node /home/node

USER node 

COPY --chown=node:node ["frontend/package.json", "frontend/pnpm-lock.yaml", "frontend/tsconfig.app.json","frontend/tsconfig.json", "frontend/angular.json", "frontend/biome.json", "frontend/.postcssrc.json", "./"]

RUN pnpm install --frozen-lockfile

COPY --chown=node:node  frontend/public ./public
COPY --chown=node:node  frontend/src ./src
COPY --chown=node:node  frontend/wailsjs ./wailsjs

RUN pnpm run web-prod

FROM golang:1.25-alpine AS backend

RUN apk add --no-cache build-base musl-dev ca-certificates

WORKDIR /app

COPY ./shared ./shared

COPY ./web ./web

RUN mkdir -p ./shared/assets/static

COPY go.work.web ./go.work

COPY ["go.work.sum", "./"]

RUN go work use ./web ./shared

COPY --from=frontend /home/node/app/dist/gurl/ ./shared/assets/static/

RUN CGO_ENABLED=1 go build -ldflags '-linkmode external -extldflags "-static" -s -w' -o bin/gurl-web ./web

FROM scratch

WORKDIR /app

COPY --from=backend /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=backend /app/bin ./bin

ENV WEB_PORT=80
EXPOSE 80

CMD ["./bin/gurl-web"]

