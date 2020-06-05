body='{
"request": {
"branch":"alloy-latest-release"
}}'

curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "User-Agent: API Explorer" \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token HcO6OHnsqaoCn87gL5kDpQ" \
   -d "$body" \
   https://api.travis-ci.org/repo/adobe%2Falloy/requests
