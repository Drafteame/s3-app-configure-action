FROM node:20-alpine

LABEL "com.github.actions.icon"="database"
LABEL "com.github.actions.color"="blue"
LABEL "com.github.actions.name"="s3-app-configure-action"
LABEL "com.github.actions.description"="Github action to help synchronize configuration files to an s3 bucket"
LABEL "org.opencontainers.image.source"="https://github.com/Drafteame/s3-app-configure-action"

COPY . /action
WORKDIR /action

RUN npm install --omit=dev

ENTRYPOINT ["node", "/action/index.js"]