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
RUN mkdir -p /app/.data
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
