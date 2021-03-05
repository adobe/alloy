#!/bin/bash
USERNAME=$1
PASSWORD=$2
BS_JOBS_URL="https://api.browserstack.com/5/workers/"
BS_KILL_JOB_URL="https://api.browserstack.com/5/worker/"
RUNNING_JOBS=$(curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" $BS_JOBS_URL | jq -r '.[].id')
for id in $RUNNING_JOBS; do
  echo "Killing job $id"
  [ ! -z $id ] && echo $(curl -X "DELETE" -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" $BS_KILL_JOB_URL/$id)
done
