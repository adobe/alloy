#!/bin/sh

(cd ../ && npm ci && npm run sandbox:build)
npm ci
(cd personalization-client-side && npm ci && npm run build)
(cd personalization-hybrid && npm ci)
(cd personalization-hybrid-spa && npm ci && npm run build)
(cd personalization-server-side && npm ci)
(cd sandbox && npm ci && npm run build)

