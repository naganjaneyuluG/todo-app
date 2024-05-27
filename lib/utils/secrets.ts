import { Stack, StackProps } from "aws-cdk-lib";
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from "constructs";


export interface MultiSecretsStackProps<S extends string> extends StackProps {
    secrets: S[];
}

/**
 * Reusable stack that creates multiple Secrets Manager Secrets by a given
 * list of names. It outputs an object, where the keys are the same values as
 * the names given in the list, and the values are the actual Secret resources.
 * The output object is useful for creating multiple ECS secrets,
 * after converting it with `convertToEcsSecrets`.
 */
export class MultiSecretsStack<SP extends MultiSecretsStackProps<S>, S extends string> extends Stack {
    readonly secrets: Record<SP["secrets"][number], secretsmanager.ISecret>;

    constructor(scope: Construct, id: string, props: SP) {
        super(scope, id, props);

        this.secrets = {} as Record<SP["secrets"][number], secretsmanager.ISecret>;

        for (const k of props.secrets) {
            this.secrets[k] = new secretsmanager.Secret(this, k);
        }
    }
}

export function convertToEcsSecrets(secrets: Record<string, secretsmanager.ISecret>): Record<string, ecs.Secret> {
    const ecsSecrets: Record<string, ecs.Secret> = {};

    for (const [k, v] of Object.entries(secrets)) {
        ecsSecrets[k] = ecs.Secret.fromSecretsManager(v);
    }

    return ecsSecrets;
}
