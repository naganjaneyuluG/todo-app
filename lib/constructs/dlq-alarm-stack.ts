import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';

interface DeadLetterQueueAlarmProps {
    queue: sqs.IQueue; 
    alarmTopic: sns.ITopic; 
}

export class DeadLetterQueueAlarm extends Construct {
    constructor(scope: Construct, id: string, props: DeadLetterQueueAlarmProps) {
        super(scope, id);

        const dlqAlarm = new cloudwatch.Alarm(this, "DLQAlarm", {
            metric: props.queue.metric("ApproximateNumberOfMessagesVisible"),
            threshold: 2,
            evaluationPeriods: 5,
            actionsEnabled: true,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            alarmDescription: "Alarm when messages are in DLQ",
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        });

        dlqAlarm.addAlarmAction(new cloudwatchActions.SnsAction(props.alarmTopic));
    }
}
