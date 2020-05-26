# Development Scripts

Several npm scripts have been provided for assisting in development. Each script can be run by navigating to the cloned repository directory in a terminal and executing `npm run scriptname` where `scriptname` is the name of the script you would like to run. The most useful scripts are as follows:

* `dev` Spins up a sandbox website where you can manually test the library as though you were a consumer using the library. The sandbox files can be found in the `sandbox` directory and can be modified to suit your needs.
* `test` Runs unit tests against source files. Tests can be found in the `test` directory.
* `test:watch` Same as `test`, but will re-run the tests as you change source files or test files.
* `lint` Analyzes code for potential errors.
* `format` Formats code to match agreed-upon style guidelines.
* `functional:local:build` Builds Alloy and runs functional tests against the result.
* `functional:local` Once you have run `functional:local:build` once and as long as the source code does not change, you can run `functional:local` to run tests without running the build process again. There are plans to improve this process in the future. 
* `functional:local:watch` Same as `functional:local`, but will re-run the tests as you change test files.

When you attempt to commit and push code changes, several of the above tasks will be run automatically to help ensure that your changes pass tests and are consistent with agreed-upon standards.
