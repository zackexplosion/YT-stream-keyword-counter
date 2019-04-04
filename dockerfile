FROM mhart/alpine-node:8.12
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# RUN apk add --no-cache yarn git python
# RUN apk add --no-cache make gcc
RUN apk update && apk add yarn git python g++ make && rm -rf /var/cache/apk/*

COPY package.json ./
COPY yarn.lock ./

# RUN npm install
# If you are building your code for production
RUN yarn --production

RUN yarn add pm2

# Bundle app source
COPY . .



EXPOSE 8080
CMD [ "pm2", "app/index.js" ]