#### QE Analytics

Official Allure Docs: [Allure Framework](https://docs.qameta.io/allure/) 

Do not commit the Allure report or test run results to git. The test run results will be stored on our QE hosting. Git currently ignoress the Allure directories. 

1) Install Allure CLI. Supports Windows, Mac and Linux.

2) Run Allure reporter using:
a) Unit Test - "npm run test:report"
b) Saucelabs - "npm run test:slreport"
c) Functional Test - The the reporter is set to Allure, view the TestCafe runner configuration "./test/functional/helpers/runner.js"

3) The XML files from the test results requires Allure to generate the analytics and report. Using your globally installed Allure, run: 

"allure generate test/results/allure-results --clean -o test/results/allure-report && allure open test/results/allure-report"

Allure takes the xml files from the report directory and generates the report to "test/results/allure-results"

*WIP* Todo: 

4) Script to generate the Allure report from the test run and host it. 
a) Store the XML test run files via FTP on QE hosting. 
b) Generate report from the test run results and host the HTML file to view dashboard using AlloyIO.com/QE