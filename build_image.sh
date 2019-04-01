#!/bin/sh

TESTCAFE_VERSION=${1:-0.23.2}

docker build \
  --build-arg TESTCAFE_VERSION=${TESTCAFE_VERSION} \
  -t honomoa/jenkins-testcafe:${TESTCAFE_VERSION}-alpine \
  .