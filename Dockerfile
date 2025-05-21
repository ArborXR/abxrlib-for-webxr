FROM node:21.6.2-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nano \
    apt-utils \
    npm

RUN mkdir /opt/informxr
WORKDIR /opt/informxr
COPY package.json ts-node-config.json tsconfig.json webpack.config.js .eslintignore .eslintrc.json .npmignore ./ 
COPY abxr-buildall.sh ./ 
RUN chmod +x abxr-buildall.sh
RUN sudo chmod 666 /opt/informxr/build/dist/AbxrLibForWebXR.js
RUN sudo rm /opt/informxr/build/dist/AbxrLibForWebXR.js
COPY src ./src

RUN npm install
RUN npm install process --save-dev

# Command to run the application.
ENTRYPOINT [ "./abxr-buildall.sh" ]
