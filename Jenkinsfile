#!/usr/bin/env groovy
node {
    BROWSER_DOCKER_PATH = 'Docker/browsers/Dockerfile'
    SHARED_LIBRARY_PATH = '/test/Pipeline.groovy'
}
pipeline {
    agent {
        node {
            label 'master'
        }
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
stage('Build and run e2e tests ') {
        //Stage: GitHub Integration
    stage('Clone sources') {
        agent {
                node {
                    label 'master'
                }
            }
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
      
                stage('Test in Chrome') {
                    agent {
                        dockerfile {
                            filename "${BROWSER_DOCKER_PATH}"
                        }
                    }
                    steps {
                        script {
                            checkout scm
                            def rootDir = pwd()
                            def flow = load "${rootDir}${SHARED_LIBRARY_PATH}"
                            flow.build()
                            flow.test('Chrome')
                        }
                    }
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
