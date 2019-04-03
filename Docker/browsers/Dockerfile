##########################################################
# Build this if you want to run UI tests on Chrome and Firefox browser with xvfb server
############################################################

FROM ubuntu:latest
MAINTAINER Shamiul Mowla "mowla@adobe.com"
# Run stuff as root

USER root

# Create global npm folder so we can install npm into it (There were problems with permissions)

RUN mkdir /opt/.npm-global

# Set npm env variable so we use the custom npm folder

ENV NPM_CONFIG_PREFIX=/opt/.npm-global

# Create node user

RUN useradd -ms /bin/sh node

# Give write permissions to folder

RUN chown node /opt/.npm-global

# Install with apt

###################################################################################################
# Possible problem when building on AWS amazon linux: add gpg-agent to list of programs to install
###################################################################################################
RUN apt-get update -qqy \
    && apt-get -qqy install \
        wget \
        curl \
        ca-certificates \
        bzip2 \
        apt-transport-https \
        software-properties-common \
        xvfb \
    && rm -rf /var/lib/apt/lists/*



# Download node installation and install
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash 2>/dev/null \
    && apt-get update -qqy \
    && apt-get install -qqy nodejs

# Install Chrome Browser

# You can specify versions by CHROME_VERSION;
#  e.g. google-chrome-stable
#       google-chrome-beta
#       google-chrome-unstable
#       latest (equivalent to google-chrome-stable)
#       google-chrome-beta (pull latest beta)

ARG CHROME_VERSION="google-chrome-stable"
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install \
    ${CHROME_VERSION:-google-chrome-stable} \
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*


# Chrome Launch Script Modification

COPY docker/browsers/bin/chrome_launcher.sh /opt/google/chrome/google-chrome
RUN chmod +x /opt/google/chrome/google-chrome

# Install Firefox Browser

# You can specify versions by FIREFOX_VERSION;
#  e.g.  latest
#        nightly-latest
#        devedition-latest

ARG FIREFOX_VERSION=latest
RUN FIREFOX_DOWNLOAD_URL=$(echo "https://download.mozilla.org/?product=firefox-$FIREFOX_VERSION&os=linux64&lang=en-US") \
  && apt-get update -qqy \
  && apt-get -qqy install firefox \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
  && wget --no-verbose -O /tmp/firefox.tar.bz2 $FIREFOX_DOWNLOAD_URL \
  && apt-get -y purge firefox \
  && rm -rf /opt/firefox \
  && tar -C /opt -xjf /tmp/firefox.tar.bz2 \
  && rm /tmp/firefox.tar.bz2 \
  && mv /opt/firefox /opt/firefox-$FIREFOX_VERSION \
  && ln -fs /opt/firefox-$FIREFOX_VERSION/firefox /usr/bin/firefox

# Install as node (npm does not recommend to install npm as root, also had problems while doing so)

USER node

# Install npm

RUN npm install -g npm@latest

# Fix problems with npm

RUN npm update
RUN npm rebuild node-sass