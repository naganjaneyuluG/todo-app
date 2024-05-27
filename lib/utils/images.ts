import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import { EcrImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export function fromImageName(scope: Construct, imageName: string): EcrImage {
    const [repositoryName, tag] = imageName.split(':');

    return ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(scope, 'Repository', repositoryName),
        tag ?? "latest",
    )
}
