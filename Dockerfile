FROM node:20.17.0-alpine3.20 AS builder
WORKDIR /app
COPY package*.json .
RUN npm install --omit=dev
COPY . .


FROM node:20.17.0-alpine3.20
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
CMD ["node","index.js"]
