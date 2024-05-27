#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getDeploymentEnv, getEnv } from '../lib/utils/env';
import { Ecrstack } from '../lib/stacks/ecr/ecr-repos';
import * as ecs from "aws-cdk-lib/aws-ecs";
import { DeploymentConfig } from '../lib/utils/deployment-config';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { SnAdminStack } from '../lib/stacks/sn-admin/sn-admin-stack'

(async () => {
    const app = new cdk.App();
    const deploymentEnv = getDeploymentEnv(app)
    const config = DeploymentConfig[deploymentEnv]


    const ECR_STACK_NAME = "ecr";
    new Ecrstack(app, ECR_STACK_NAME, {
        env: getEnv(app, ECR_STACK_NAME),
        repositoryNames: [
            "opensuperappshop",
        ]
    });

    const SN_ADMIN_STACK_NAME = "snAdmin";
    new SnAdminStack(app, SN_ADMIN_STACK_NAME, {
        env: getEnv(app, SN_ADMIN_STACK_NAME),

        image: app.node.tryGetContext(`stack-${SN_ADMIN_STACK_NAME}-image`) ?? "snadmin:latest",

        cpu: config.snAdmin.cpu,
        memoryLimitMiB: config.snAdmin.memoryLimitMiB,
        minCapacity: config.snAdmin.minCapacity,
        maxCapacity: config.snAdmin.maxCapacity,
        desiredCount: config.snAdmin.desiredCount,

    });

    
})();
