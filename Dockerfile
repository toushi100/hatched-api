FROM node:16.13.0-alpine as development

# Set the npm version to match your project's required version
RUN npm install -g npm@9.8.0


# Set the npm registry to avoid potential issues with package installation
# RUN npm config set registry https://registry.npmjs.org/

WORKDIR /usr/src/app

# Adding this because we need bash to start the server in production, but alpine does not come with bash
# Install git and openssh-client
RUN apk add --no-cache git bash

# Set Git to use HTTPS instead of SSH for fetch operations
# RUN git config --global url."https://".insteadOf git:// && \
# git config --global url."https://github.com/".insteadOf "git@github.com:"

# Clean npm cache (to avoid potential caching issues)
RUN npm cache clean --force

COPY package*.json ./

# Update the package repositories and add alpine-sdk
RUN apk update && apk add --no-cache --virtual .build-deps alpine-sdk

# Install dependencies using the specific npm version
RUN npm install

COPY . .

# Build your Node.js application
RUN npm run build

# Expose the port on which your application listens (replace with the actual port number)
EXPOSE 3000

# Run your application using the "startup.sh" script (or use your own start command if no script)
CMD ["/bin/bash", "startup.sh"]
