# ----------------------------------------------------
# Backend API (Express + TypeScript + Argon2)
# ----------------------------------------------------
FROM node:20-alpine
WORKDIR /app

# Toolchain necesaria para compilar argon2
RUN apk add --no-cache python3 make g++

# Copiar los archivos de dependencias
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Instalar dependencias (incluyendo devDependencies para TypeScript)
RUN if [ -f package-lock.json ]; then npm ci --include=dev; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --include=dev; \
    else npm i --include=dev; fi

# Copiar configuración de TypeScript y el código fuente
COPY tsconfig.json ./tsconfig.json
COPY src ./src

# Compilar TypeScript → genera dist/
RUN npm run build

# Configurar entorno y puerto
ENV NODE_ENV=production
EXPOSE 3000

# Ejecutar servidor compilado
CMD ["node", "dist/server.js"]
