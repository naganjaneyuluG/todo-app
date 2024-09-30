pipeline {
    agent{
        docker {
            image: 'docker'
            args '-u root'
        }
    }
    stages{
        stage('chekout code ') {
            steps {
                git 'https://github.com/myorg-g/todo-app'
            }
        }
        stage('docker build') {
            steps{
                sh 'docker build -t nodeapp:latest .'
            }
        }
        stage('aqua scan') {
            steps{
                sh 'aqua containerRuntime: 'docker', customFlags: '', hideBase: false, hostedImage: '', localImage: 'nodeapp:latest', localToken: '', locationType: 'local', notCompliesCmd: '', onDisallowed: 'ignore', policies: '', register: false, registry: '', scannerPath: '', showNegligible: false, tarFilePath: '''
            }
        }

    }
}