#! /usr/bin/env bash

VERSION=$1

# install dependencies
npm ci

# setup configuration
git config user.name $GITHUB_ACTOR
git config user.email gh-actions-${GITHUB_ACTOR}@github.com
git remote add gh-origin https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git/
npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN}

# update version in package.json and package-lock.json
npm version ${VERSION} --git-tag-version=false
git add package.json package-lock.json
git commit -m "${VERSION}"

# publish the package to NPM if it hasn't already been published
if [[ -z "$(npm view @adobe/alloy@${VERSION})" ]]; then
  echo "Publishing to NPM"
  npm publish --access public
else
  echo "NPM already has version ${VERSION}"
fi

# update reference to NPM version
npm install @adobe/alloy@${VERSION} --save-dev
git add package.json package-lock.json

# tag and push the release
git commit -m "update self devDependency to ${VERSION}"
git tag -a "v${VERSION}" -m "${VERSION}"
git push gh-origin HEAD:${GITHUB_REF} --follow-tags

# build alloy.js and alloy.min.js to upload as release assets
npm run build