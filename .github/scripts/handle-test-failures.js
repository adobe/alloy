module.exports = async ({ github, context, browser }) => {
    const fs = require('fs');
    const path = require('path');
  
    // Read the test results
    const testResultsDir = './test-results';
    const files = fs.readdirSync(testResultsDir);
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(testResultsDir, file), 'utf8');
      let result;
      try {
        result = JSON.parse(content);
      } catch (error) {
        console.error(`Error parsing JSON from ${file}: ${error}`);
        continue;
      }
      
      if (result.status === 'failed') {
        const testName = result.name;
        const sauceLabsLink = `https://app.saucelabs.com/tests/${result.id}`;
        
        // Search for an existing issue
        const issues = await github.rest.issues.listForRepo({
          owner: context.repo.owner,
          repo: context.repo.repo,
          state: 'open',
          labels: ['test-failure', browser]
        });
        
        const existingIssue = issues.data.find(issue => issue.title.includes(testName));
        
        if (existingIssue) {
          // Update existing issue
          await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: existingIssue.number,
            body: `Test failed again in the latest run.\nBrowser: ${browser}\nRun: ${context.runId}\n[View on SauceLabs](${sauceLabsLink})`
          });
        } else {
          // Create new issue
          await github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: `Test Failure: ${testName} (${browser})`,
            body: `The test "${testName}" failed in the ${browser} browser.\n\nRun: ${context.runId}\n[View on SauceLabs](${sauceLabsLink})`,
            labels: ['test-failure', browser]
          });
        }
      }
    }
  };