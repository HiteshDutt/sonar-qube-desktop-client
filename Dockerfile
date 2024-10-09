#dockerfile for building node image
FROM node:22.9.0 AS BUILD
# Create app directory
WORKDIR /usr/app
# Install app dependencies
COPY . .

RUN npm install && npm run build

FROM node:20.18-alpine3.20 AS FINAL
WORKDIR /app/
COPY --from=build /usr/app/node_modules/ ./node_modules/
COPY --from=BUILD /usr/app/dist ./dist/
CMD ["node", "/app/dist/index.read.js"]