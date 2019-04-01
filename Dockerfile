FROM alpine:edge

ARG TESTCAFE_VERSION
ENV TESTCAFE_VERSION=${TESTCAFE_VERSION:-0.23.2}

COPY testcafe.sh /bin/testcafe

RUN apk --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ upgrade  && \
    apk --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ add         \
    nodejs nodejs-npm chromium firefox xwininfo xvfb dbus eudev ttf-freefont fluxbox procps    \
    bash git openssh

RUN npm install -g testcafe@${TESTCAFE_VERSION} testcafe-reporter-xunit                     && \
    npm cache clean --force                                                                 && \
    rm -rf /tmp/*                                                                           && \
    unlink /usr/bin/testcafe                                                                && \
    ln -s /bin/testcafe /usr/bin/testcafe                                                   && \
    chmod +x /usr/bin/testcafe                                                              && \
    adduser -D user

USER user

EXPOSE 1337 1338