FROM alpine:edge

RUN apk --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ add \
    nodejs \
    nodejs-npm \
    chromium \
    firefox \
    xwininfo \
    xvfb \
    dbus \
    eudev \
    ttf-freefont \
    fluxbox

WORKDIR /opt/testcafe
RUN adduser -D -h /opt/testcafe user
USER user

RUN npm install \
    testcafe \
    testcafe-react-selectors \
    testcafe-aurelia-selectors \
    && npm cache clean --force \
    && rm -rf /tmp/*

ENV NODE_PATH=/opt/testcafe/node_modules
ENV PATH=${PATH}:/opt/testcafe/node_modules/.bin

USER root
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENV SCREEN_WIDTH=1280
ENV SCREEN_HEIGHT=720

VOLUME [ "/test" ]
EXPOSE 1337 1338
USER user
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "testcafe" ]