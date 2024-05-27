import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr"

export interface EcrstackProps extends StackProps {
    repositoryNames: string[],
    prefix?: string,
}

export class Ecrstack extends Stack {
    constructor(scope: Construct, id: string, props: EcrstackProps) {
        super(scope, id, props)

        for (const repositoryName of props.repositoryNames) {
            new ecr.Repository(this, `Repository-${repositoryName}`, {
                repositoryName: (props.prefix || "") + repositoryName,
            })
        }
    }
}
