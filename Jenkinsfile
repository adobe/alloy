pipeline {
  agent {
    docker {
      image 'node:6-alpine'
    }

  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
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