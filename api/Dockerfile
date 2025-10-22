FROM node:20-alpine
WORKDIR /app

# Toolchain para argon2
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i; \
    else npm i; fi

COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]