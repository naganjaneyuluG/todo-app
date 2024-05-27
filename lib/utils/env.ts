import { Construct } from "constructs";
import { Accounts, DeploymentEnv, ENVS } from "./deployment-config";
import { Environment } from "aws-cdk-lib";

/**
 * Returns an `env` object to be passed to StackProps
 */
export function getEnv(
    scope: Construct,
    stackName?: string,
    defaultRegion?: string,
    defaultAccount?: string): Required<Environment> {

    const regionFromContext = stackName ?
        scope.node.tryGetContext(`stack-${stackName}-region`) :
        undefined;
    const accountFromContext = stackName ?
        scope.node.tryGetContext(`stack-${stackName}-account`) :
        undefined;

    const deploymentEnv = getDeploymentEnv(scope);
    const regionFromEnv = Accounts[deploymentEnv].region;
    const accountFromEnv = Accounts[deploymentEnv].account;

    return {
        region: regionFromContext ||
            regionFromEnv ||
            defaultRegion ||
            scope.node.tryGetContext('region') ||
            process.env.CDK_DEFAULT_REGION,

        account: accountFromContext ||
            accountFromEnv ||
            defaultAccount ||
            scope.node.tryGetContext('account') ||
            process.env.CDK_DEFAULT_ACCOUNT,
    }
}

/**
 * Returns the current deployment environment, as passed via the `--context env=...` flag.
 * Throws an error if the environment is invalid.
 */
export function getDeploymentEnv(scope: Construct): DeploymentEnv {
    const deploymentEnv = scope.node.tryGetContext("env") as DeploymentEnv;
    if (!ENVS.includes(deploymentEnv)) {
        throw new Error(
            `Invalid deployment environment: '${deploymentEnv}'. ` +
            `Please set it using --context env=dev|qa|staging|prod`
        );
    }
    return deploymentEnv;
}
