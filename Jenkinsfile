pipeline {
  agent {
    docker {
      image 'node:6-alpine'
      args '-p 3000:3000'
    }

  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
      }
    }
  }
  environment {
    GITHUB_CLONE_URL = 'git@git.corp.adobe.com:Activation/a-tag.git'
    GITHUB_CLONE_CREDENTIALS = 'mowla'
    GITHUB_CLONE_ORG = 'Activation'
    GITHUB_CLONE_REPO = 'a-tag'
    GITHUB_CLONE_BRANCH = 'feature/jenkins-docker'
    EMAIL_ENABLED = true
    EMAIL_RECIPIENTS = 'mowla@adobe.com'
  }
  post {
    failure {
      script {
        currentBuild.result = 'FAILURE'
      }


    }

    always {
      script {
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