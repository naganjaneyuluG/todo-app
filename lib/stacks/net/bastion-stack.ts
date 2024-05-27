import { Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface BastionStackProps extends StackProps {
    vpc?: ec2.IVpc;
    subnetSelection?: ec2.SubnetSelection;
    connections: {
        remoteConnectable: ec2.IConnectable,
        port: ec2.Port,
        description?: string,
    }[];
}

export class BastionStack extends Stack {
    readonly instance: ec2.IInstance;

    constructor(scope: Construct, id: string, props: BastionStackProps) {
        super(scope, id, props);

        const vpc = props.vpc ?? ec2.Vpc.fromLookup(this, 'DefaultVPC', {
            isDefault: true,
        });

        this.instance = new ec2.BastionHostLinux(this, 'Bastion', {
            vpc,
            subnetSelection: props.subnetSelection ?? {
                subnetType: ec2.SubnetType.PUBLIC,
            },

            // Hardcoding the AMI Name to avoid accidental replacement
            machineImage: ec2.MachineImage.lookup({
                name: "amzn2-ami-kernel-5.10-hvm-2.0.20230727.0-x86_64-gp2",
            }),
        });

        // Allow connections from bastion to connectables
        for (const { remoteConnectable, port, description } of props.connections) {
            this.instance.connections.allowTo(
                remoteConnectable,
                port,
                description,
            );
        }
    }
}
