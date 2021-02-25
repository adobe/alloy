#!/usr/bin/env bash
 
# exit if any command exits with non-zero status
set -e 
 
GITHUB_TOKEN="INSERT_TOKEN" 
REPO="adobe/alloy"
TEMP_FILE="temp.json"
SLEEP_INTERVAL=30
 
echo "Checking conclusion of the last executed run in adobe/alloy repository:"
 
while true; do
 
    curl \
        --silent \
        --location \
        --request GET \
        --header 'Accept: application/vnd.github.everest-preview+json' \
        --header 'Content-Type: application/json' \
        --header "Authorization: token $GITHUB_TOKEN" \
        --header 'cache-control: no-cache' \
        "https://api.github.com/repos/adobe/alloy/actions/runs" > $TEMP_FILE

    STATUS=$(jq -r ".workflow_runs | sort_by( .created_at ) | .[-1] | .status" $TEMP_FILE)
    echo "Check suite state: ${STATUS}"
 
    if [ "$STATUS" = "completed" ]; then
        CONCLUSION=$(jq -r ".workflow_runs | sort_by( .created_at ) | .[-1] | .conclusion" $TEMP_FILE)
        echo "Check suite conclusion: ${CONCLUSION}"
        break;
    fi
 
    sleep $SLEEP_INTERVAL
done
 
rm $TEMP_FILE || true