#! /usr/bin/env bash

VERSION=$1

# When sftp commands are run in batch mode (-b flag), commands prefixed with "-" do not fail the
# entire script. By prefixing mkdir with "-", this will not fail if the directory already exists.
echo "-mkdir $VERSION"
echo "cd $VERSION"
echo "put ./dist/alloy.js"
echo "put ./dist/alloy.min.js"
echo "bye"
