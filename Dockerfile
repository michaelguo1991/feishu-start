FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache libstdc++
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/.data/db.sqlite
COPY --from=build /app/.output ./.output
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=build /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=build /app/.output/server/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=build /app/.output/server/node_modules/bindings ./node_modules/bindings
COPY --from=build /app/.output/server/node_modules/file-uri-to-path ./node_modules/file-uri-to-path
RUN mkdir -p /app/.data
EXPOSE 3000
CMD ["sh", "-c", "node scripts/migrate.mjs && node .output/server/index.mjs"]
