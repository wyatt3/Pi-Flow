FROM node:20-bullseye

USER root
RUN apt-get update && \
    apt-get install -y libgpiod-dev gpiod

WORKDIR /usr/src/app
COPY ../package*.json ./
RUN npm install
RUN chown -R node:node /usr/src/app

USER node
CMD ["npm", "run", "dev"]
