pipeline {
    agent {
        docker {
            image 'docker'
            args '-u root'
        }
    }
    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/myorg-g/todo-app'
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t nodeapp:latest .'
            }
        }
        stage('Aqua Scan') {
            steps {
                script {
                    sh '''
                    aqua containerRuntime='docker' \
                         customFlags='' \
                         hideBase=false \
                         hostedImage='' \
                         localImage='nodeapp:latest' \
                         localToken='' \
                         locationType='local' \
                         notCompliesCmd='' \
                         onDisallowed='ignore' \
                         policies='' \
                         register=false \
                         registry='' \
                         scannerPath='' \
                         showNegligible=false \
                         tarFilePath=''
                    '''
                }
            }
        }
    }
    post {
        always {
            mail bcc: '', 
                 cc: 'ganji7337@gmail.com', 
                 from: '', 
                 replyTo: '', 
                 subject: "Build Status Notification - ${JOB_NAME} #${BUILD_NUMBER}", 
                 to: 'venkeycloud@gmail.com', 
                 body: """Subject: Build Status Notification - ${JOB_NAME} #${BUILD_NUMBER}

Hi Team,

The build for **${JOB_NAME}** has completed with the following status:

**Build Details:**
- **Build Number:** ${BUILD_NUMBER}
- **Status:** ${BUILD_STATUS} 
- **Triggered By:** ${BUILD_TRIGGER}
- **Start Time:** ${BUILD_TIMESTAMP}
- **Duration:** ${DURATION}
- **Commit:** ${GIT_COMMIT}
- **Commit Message:** ${GIT_MESSAGE}

**Build URL:** [View Build](${BUILD_URL})

**Summary:**
- The build was **${BUILD_STATUS}**. 
- For more information, check the logs [here](${BUILD_URL}/console).

If you have any questions or need assistance, please reach out.

Best,  
Your CI/CD Team
"""
        }
    }
}
