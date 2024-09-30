#dockerfile for building node image
FROM node:22.90.0 as BUILD
# Create app directory
WORKDIR /usr/app
# Install app dependencies
COPY . .

RUN npm install

RUN npm run build

FROM node 22.90.0 as FINAL
WORKDIR /app/
COPY --from=build /usr/app/node_modules/ ./node_modules/
COPY --from=BUILD /usr/app/dist ./dist/
CMD ["node", "/app/dist/index.js"]