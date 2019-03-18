# Functional Testing

## Dependencies

COMING SOON

## Running Tests

To run the tests with a default browser use `npm run functional`. By default, it runs all tests.

### Enviornment Variables 
We've implemented support for environment variables in automation and a `.env` file for local environments. To specify your variables, for example use `URL = 'http://www.example.com/'` in your `.env`. 

Use example .env:

```
cp /test/.env.example .env
```

### Specifying Browsers
To run the tests with a different browser use a comma-separated value as in `BROWSERS='chrome,safari' npm run functional`. 

To run tests against a browser in sauce labs, you will need the sauce labs credentials in your `.env`. 

### Specifying Test Files
To run a subset of the tests, specify the path to the test files like this:

`TEST_FILES='test/functional/specs/atag-1.testcafe.js,test/functional/specs/atag-2.testcafe.js' npm run functional`.

Both `BROWSERS` and `TEST_FILES` accept a comma delimited list of entries.

## Writing Tests

### Helper Library
Inside `/helper`, there are "prerecorded" actions and assertions that comprise common actions a user might do with console. To write tests, we can reuse those:

```
```

### Writing New Tests
[Test Cafe Documentation](https://devexpress.github.io/testcafe/documentation/test-api/)
