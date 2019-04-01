pipeline {
    agent {
        docker { image 'testcafe/testcafe' }
    }
    environment{
    GITHUB_CLONE_URL = 'git@git.corp.adobe.com:Activation/a-tag.git'
    GITHUB_CLONE_CREDENTIALS = 'mowla'
    GITHUB_CLONE_ORG = 'Activation'
    GITHUB_CLONE_REPO = 'a-tag'
    GITHUB_CLONE_BRANCH = 'feature/jenkins-docker'
    EMAIL_ENABLED = true
    EMAIL_RECIPIENTS = 'mowla@adobe.com'
    }

    stages{
    stage("clean workspace") {
        steps {
            deleteDir()
        }
    }

    //Stage: GitHub Integration
    stage('Clone sources') {
        steps{
            script{
                def gitbranch = "${env.GITHUB_CLONE_BRANCH}"
                if (!env.GITHUB_CLONE_BRANCH) {
                    gitbranch = "${env.GIT_BRANCH}"
                }else{
                     //to handle issue with origin/BRANCH_NAME
                     def gitbranchOriginSplit = gitbranch.split('origin/')
                     def gitbranchOriginSplitLength = gitbranchOriginSplit.size()
                     gitbranch = gitbranchOriginSplitLength > 1 ? gitbranchOriginSplit[1] : gitbranch
                 }
                print "git branch is ${gitbranch}"
                git credentialsId: "${env.GITHUB_CLONE_CREDENTIALS}", url: "${env.GITHUB_CLONE_URL}", branch: "${gitbranch}"
            }
        }
    }

    stage('Run TestCafe') {
        steps {
            sh 'testcafe "firefox,chromium --no-sandbox" test/functional/spec/*.js'
        }
    }    
        
    }
    post {
        failure {
            script {
                currentBuild.result = 'FAILURE'
            }
        }
        always {
            script{
                if(env.EMAIL_ENABLED.toBoolean()){
                    step([$class: 'Mailer',
                        notifyEveryUnstableBuild: true,
                        recipients: "${env.EMAIL_RECIPIENTS}",
                        sendToIndividuals: true])
                }
            }
        }
    }
}
