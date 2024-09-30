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
}
