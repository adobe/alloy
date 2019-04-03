#!/usr/bin/env groovy
node {
    BROWSER_DOCKER_PATH = 'docker/browsers/Dockerfile'
    SHARED_LIBRARY_PATH = '/vars/Pipeline.groovy'
}
pipeline {
    agent {
        docker { image 'node:7-alpine' }
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

    stage('Install dependencies') {
        steps {
            sh 'npm install'
        }
    }

     stage('Build and run e2e tests ') {
            parallel {
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
                stage('Test in Firefox') {
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
                            flow.test('Firefox')
                        }
                    }
                }
            }
        }
        stage('Publish reports') {
            agent {
                node {
                    label 'master'
                }
            }
            steps {
                script {
                    checkout scm
                    def rootDir = pwd()
                    def flow = load "${rootDir}${SHARED_LIBRARY_PATH}"
                    flow.publishReports()
                    flow.checkTests()
                }
            }
        }
    }
    post {
        failure {
            script {
                checkout scm
                def rootDir = pwd()
                def flow = load "${rootDir}${SHARED_LIBRARY_PATH}"
                flow.checkForFailure()
            }
        }
    }
}