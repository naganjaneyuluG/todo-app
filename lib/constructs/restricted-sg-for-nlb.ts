import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

export interface RestrictedSgForNlbProps {
    vpc: ec2.IVpc,

    /**
     * The peer to allow access to the NLB from.
     * This can be either the public Internet, or CloudFront edges prefix list
     */
    allowFromPeer: ec2.IPeer,

    /**
     * The service IConnectable to allow access to, from the NLB.
     */
    serviceConnectable: ec2.IConnectable,

    serviceContainerPort: number,

    serviceNlb: elb.INetworkLoadBalancer,
    serviceTargetGroup: elb.INetworkTargetGroup,
}

/**
 * This construct configures a security group for a network load balancer.
 * This is a workaround until native NLB SG support is added to the NLB CDK
 * construct.
 * See: https://github.com/aws/aws-cdk/issues/26735
 */
export class RestrictedSgForNlb extends Construct {
    constructor(scope: Construct, id: string, props: RestrictedSgForNlbProps) {
        super(scope, id);

        const nlbSg = new ec2.SecurityGroup(this, 'NlbSg', {
            vpc: props.vpc,
            allowAllOutbound: true
        });

        nlbSg.addIngressRule(
            ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            ec2.Port.tcp(80),
            "Allow from VPC"
        );

        nlbSg.addIngressRule(
            props.allowFromPeer,
            ec2.Port.tcp(80),
        );

        props.serviceConnectable.connections.allowFrom(
            nlbSg,
            ec2.Port.tcp(props.serviceContainerPort),
            "Allow from NLB"
        );

        const cfnLb = (props.serviceNlb.node.defaultChild as elb.CfnLoadBalancer);

        // Changing logical ID to force recreating the NLB with a SG, in case it
        // was originally created without a SG.
        cfnLb.overrideLogicalId('Nlb1');

        // Attach the SG to the NLB
        cfnLb.addPropertyOverride(
            'SecurityGroups',
            [nlbSg.securityGroupId],
        );

        // Changing the logical ID of the TG to force recreating it, to prevent
        // the TG from being attached to multiple NLBs while the NLB is being
        // recreated.
        const cfnTg = (props.serviceTargetGroup.node.defaultChild as elb.CfnTargetGroup);
        cfnTg.overrideLogicalId('NlbTg1');
    }
}
