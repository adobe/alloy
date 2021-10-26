#! /usr/bin/env bash

VERSION=$1

# verify the files are available on the cdn
ALLOY_MIN_JS="https://cdn1.adoberesources.net/alloy/${VERSION}/alloy.min.js"
STATUS_CODE=$(curl -o /dev/null -Isw '%{http_code}\n' $ALLOY_MIN_JS)
if [ $STATUS_CODE != "200" ]; then
  echo "curl request to $ALLOY_MIN_JS returned status code $STATUS_CODE" 1>&2
  exit 1
fi

ALLOY_JS="https://cdn1.adoberesources.net/alloy/${VERSION}/alloy.js"
STATUS_CODE=$(curl -o /dev/null -Isw '%{http_code}\n' "${ALLOY_JS}")
if [ $STATUS_CODE != "200" ]; then
  echo "curl request to $ALLOY_JS returned status code $STATUS_CODE" 1>&2
  exit 1
fi

echo "Verified files are available on CDN"
