#### QE Analytics 

Official Allure Docs: [Allure Framework](https://docs.qameta.io/allure/) 

1) Install Allure CLI.

2) Run Allure reporter using:
a) Unit Test - "npm run test:report"
b) Saucelabs - "npm run test:slreport"

3) Generate Allure dashbaord from run results: Run "allure generate test/results/allure-results --clean -o test/results/allure-report && allure open test/results/allure-report"
