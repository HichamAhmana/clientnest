FROM node:22-alpine

WORKDIR /app

# Dependency layer (cache-friendly)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    elif [ -f yarn.lock ]; then yarn install; \
    else npm install; fi

# App source
COPY . .

# Disable Next telemetry
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Dev server (hot reload)
CMD ["npm", "run", "dev"]
