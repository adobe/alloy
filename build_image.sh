#!/bin/sh

TESTCAFE_VERSION=${1:-0.23.2}

docker build \
  --build-arg TESTCAFE_VERSION=${TESTCAFE_VERSION} \
  -t testcafe/testcafe:${TESTCAFE_VERSION}-alpine \
  .