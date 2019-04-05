FROM node:8.12-alpine

ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app/scanner

RUN apk update && apk add yarn git python g++ make && rm -rf /var/cache/apk/*

COPY scanner/package.json ./
COPY scanner/yarn.lock ./

# RUN npm install
# If you are building your code for production
RUN yarn --production

# Bundle app source
COPY scanner .
COPY util ../util

RUN apk del git python g++ make
CMD [ "yarn", "start" ]