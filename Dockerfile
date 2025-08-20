FROM node:21.6.2-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nano \
    apt-utils \
    npm \
    nginx

RUN mkdir /opt/arborxr
WORKDIR /opt/arborxr
COPY package.json ts-node-config.json tsconfig.json webpack.config.js .eslintignore .eslintrc.json .npmignore README.md LICENSE package-README.md ./ 
COPY abxr-launch.sh ./ 
RUN chmod +x abxr-launch.sh
COPY src ./src
COPY testers ./testers
COPY scripts ./scripts

RUN npm install
RUN npm install process --save-dev

# Command to run the application.
ENTRYPOINT [ "./abxr-launch.sh" ]
