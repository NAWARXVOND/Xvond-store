FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_IMAGE_HOSTNAME
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH NEXT_PUBLIC_IMAGE_HOSTNAME=$NEXT_PUBLIC_IMAGE_HOSTNAME
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S xvond && adduser -S xvond -G xvond
COPY --from=build --chown=xvond:xvond /app/.next/standalone ./
COPY --from=build --chown=xvond:xvond /app/.next/static ./.next/static
COPY --from=build --chown=xvond:xvond /app/public ./public
USER xvond
EXPOSE 3000
CMD ["node", "server.js"]
