def build() {
    echo "Building Job with ID ${env.BUILD_ID}"
    sh 'mkdir -p reports'
    sh 'npm install'
}

def test(BROWSER) {
    build()
    sh "npm run testDocker${BROWSER}"
    stash name: "${BROWSER}-report-stash", includes: "**/reports/${BROWSER}.json"
}

def publishReports() {
    echo "Publishing reports:"
    sh 'rm -rf reports'
    unstash "Firefox-report-stash"
    unstash "Chrome-report-stash"
    sh 'npm run generateHtmlReport'
    Date date = new Date()
    String datePart = date.format("dd/MM/yyyy")
    String timePart = date.format("HH:mm:ss")
    GString DATETIME = "_${datePart}_${timePart}"
    publishHTML([
            allowMissing         : false,
            alwaysLinkToLastBuild: false,
            keepAll              : true,
            reportDir            : "reports/combined",
            reportFiles          : "index.html",
            reportName           : "HTML Report${DATETIME}",
            reportTitles         : ""])
}

def checkTests() {
    def result = sh script: "node test/reports/checkTests.js", returnStatus: true
    if (result != 0) {
        echo "Check log for failed e2e tests!"
        currentBuild.result = "FAILURE"
        return
    }
    sh 'rm -rf reports'
}

def checkForFailure() {
    def JOBURL = env.JOB_URL
    if (JOBURL == null) {
        JOBURL = "WARNING: Jenkins URL not set! Set Jenkins URL at http://localhost:8080/configure"
        echo "$JOBURL \n\nERROR: Build failed! Check CucumberJS reports for more details\n"
    } else {
        echo "ERROR: Build failed! Check the CucumberJS reports at $JOBURL"
    }
}

return this