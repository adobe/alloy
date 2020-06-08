body='{
"request": {
"branch":"organize-travis-jobs",
"config": {
    "env": {
        "global": ["ALLOY_ENV=prod"]
    }
}
}}'

curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "User-Agent: API Explorer" \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token j4RcsyanM-dKnjyo0YuUOA" \
   -d "$body" \
   https://api.travis-ci.com/repo/adobe%2Falloy/requests
