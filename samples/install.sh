#!/bin/sh

(cd ../ && npm install && npm run sandbox:build)
npm install
(cd personalization-client-side && npm install && npm run build)
(cd personalization-hybrid && npm install)
(cd personalization-hybrid-spa && npm install && npm run build)
(cd personalization-server-side && npm install)
(cd sandbox && npm install && npm run build)

