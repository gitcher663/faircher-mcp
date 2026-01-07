# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

# Include source code and supporting modules required for compilation
COPY src ./src
COPY tools ./tools
COPY adapters ./adapters
COPY services ./services
COPY schemas ./schemas

RUN npm run build


# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

CMD ["npm", "start"]
