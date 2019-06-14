FROM openjdk:8-jdk-slim
LABEL maintainer="mowla@adobe.com"

ARG RELEASE=2.12.0
ARG ALLURE_REPO=https://dl.bintray.com/qameta/maven/io/qameta/allure/allure-commandline

RUN apt-get update
RUN apt-get install curl -y
RUN apt-get install vim -y
RUN apt install python-pip -y
RUN pip install Flask
RUN apt-get install --reinstall procps -y
RUN apt-get install wget
RUN apt-get install unzip -y
RUN apt-get install apt-utils -y

RUN wget --no-verbose -O /tmp/allure-commandline-2.12.0.zip https://dl.bintray.com/qameta/maven/io/qameta/allure/allure-commandline/2.12.0/allure-commandline-2.12.0.zip
RUN unzip /tmp/allure-commandline-2.12.0.zip -d /
RUN rm -rf /tmp/*

RUN apt-get remove --auto-remove wget -y

RUN chmod -R +x /allure-$RELEASE/bin

COPY driver /app/driver

ENV ALLURE_HOME=/allure-$RELEASE
ENV PATH=$PATH:$ALLURE_HOME/bin
ENV RESULTS_DIRECTORY=/app/allure-results
ENV REPORT_DIRECTORY=/app/allure-report
RUN allure --version

WORKDIR /app
ADD runAllure.sh /app
ADD generateAllureReport.sh /app
ADD checkAllureResultsFiles.sh /app
ADD runAllureService.sh /app
RUN mkdir $RESULTS_DIRECTORY
RUN mkdir $REPORT_DIRECTORY

VOLUME [ "$RESULTS_DIRECTORY" ]

ENV PORT=4040
EXPOSE $PORT
EXPOSE 5050

RUN ["chmod", "+x", "/app/runAllure.sh"]
RUN ["chmod", "+x", "/app/runAllureService.sh"]
RUN ["chmod", "+x", "/app/checkAllureResultsFiles.sh"]