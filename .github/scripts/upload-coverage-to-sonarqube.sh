#!/bin/bash

# Script to download GitHub workflow artifact and upload to private SonarQube instance
# Usage: ./upload-to-private-sonar.sh <github_token> <repo_owner> <repo_name> <run_id> <sonar_host_url> <sonar_token>

set -e

if [ $# -ne 6 ]; then
    echo "Usage: $0 <github_token> <repo_owner> <repo_name> <run_id> <sonar_host_url> <sonar_token>"
    echo "Example: $0 ghp_xxx adobe alloy 12345 https://sonar.company.com sonar_xxx"
    exit 1
fi

GITHUB_TOKEN=$1
REPO_OWNER=$2
REPO_NAME=$3
RUN_ID=$4
SONAR_HOST_URL=$5
SONAR_TOKEN=$6

ARTIFACT_NAME="sonar-coverage-report"
TEMP_DIR=$(mktemp -d)

echo "Downloading artifact from GitHub workflow run $RUN_ID..."

# Download the artifact using GitHub CLI
gh auth login --with-token <<< "$GITHUB_TOKEN"
gh run download "$RUN_ID" --repo "$REPO_OWNER/$REPO_NAME" --name "$ARTIFACT_NAME" --dir "$TEMP_DIR"

echo "Artifact downloaded to $TEMP_DIR"

# Check if lcov.info exists
if [ ! -f "$TEMP_DIR/lcov.info" ]; then
    echo "Error: lcov.info not found in downloaded artifact"
    exit 1
fi

echo "Running SonarQube scanner..."

# Run SonarQube scanner with the downloaded coverage file
sonar-scanner \
    -Dsonar.projectKey=alloy \
    -Dsonar.sources=packages/core/src \
    -Dsonar.tests=packages/core/test \
    -Dsonar.javascript.lcov.reportPaths="$TEMP_DIR/lcov.info" \
    -Dsonar.host.url="$SONAR_HOST_URL" \
    -Dsonar.login="$SONAR_TOKEN"

echo "SonarQube analysis completed successfully!"

# Clean up
rm -rf "$TEMP_DIR"