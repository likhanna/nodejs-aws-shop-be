FROM node:20-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Dependencies
FROM base AS dependencies
COPY package*.json ./
RUN npm install && npm cache clean --force

# Build
FROM dependencies AS build
COPY . .
RUN npm run build

# Application
FROM node:20-alpine AS application

COPY --from=dependencies /usr/src/app/package*.json ./
# RUN npm install --only=production
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

USER node
ENV PORT=4000
EXPOSE 4000

CMD [ "node", "dist/main.js" ]