FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV NEXT_PUBLIC_BACKEND_URL=http://queryjobs.local
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN npm run build

RUN npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start"]