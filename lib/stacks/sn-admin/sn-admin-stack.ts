import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from 'constructs';
import { fromImageName } from '../../utils/images';
import * as iam from 'aws-cdk-lib/aws-iam';
import { RestrictedSgForNlb } from '../../constructs/restricted-sg-for-nlb';

export interface SnAdminStackProps extends cdk.StackProps {
  ecsCluster?: ecs.ICluster;
  vpc?: ec2.IVpc;
  image: string;
  cpu?: number;
  memoryLimitMiB?: number;
  minCapacity?: number;
  maxCapacity?: number;
  desiredCount?: number;
}

export class SnAdminStack extends cdk.Stack {
  readonly loadBalancedFargateService: ecsPatterns.NetworkLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props: SnAdminStackProps) {
    super(scope, id, props);

    let vpc = props?.vpc;
    if (!vpc) {
      vpc = ec2.Vpc.fromLookup(this, 'DefaultVPC', {
        isDefault: true,
      });
    }

    let ecsCluster = props?.ecsCluster;
    if (!ecsCluster) {
      ecsCluster = new ecs.Cluster(this, 'FargateCluster', {
        enableFargateCapacityProviders: true,
        vpc: vpc,
      });
    }

    // Create an IAM role for the ECS task
    const ecsTaskRole = new iam.Role(this, "EcsTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    const image = fromImageName(this, props.image);
    const containerPort = 3000;

    this.loadBalancedFargateService = new ecsPatterns.NetworkLoadBalancedFargateService(this, 'Service', {
      cluster: ecsCluster,
      cpu: props.cpu ?? 256,
      memoryLimitMiB: props.memoryLimitMiB ?? 512,
      desiredCount: props.desiredCount ?? 1,
      taskImageOptions: {
        image: image,
        environment: {
          PORT: String(containerPort),
          BASE_PATH: "/",
          BASE_URL: "https://api-v1.sniffynose.com/api/v1/",
          APP_ENV: 'prod',
        },
        containerPort: containerPort,
        containerName: "sn-admin",
        taskRole: ecsTaskRole,
      },
      assignPublicIp: true,
      publicLoadBalancer: true,
      healthCheckGracePeriod: Duration.minutes(1),
    });

    this.loadBalancedFargateService.service.connections.allowFrom(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(containerPort),
      "Allow from the Internet"
    );

    new RestrictedSgForNlb(this, 'RestrictedSgForNlb', {
      vpc: vpc,
      allowFromPeer: ec2.Peer.anyIpv4(),
      serviceConnectable: this.loadBalancedFargateService.service,
      serviceContainerPort: containerPort,
      serviceNlb: this.loadBalancedFargateService.loadBalancer,
      serviceTargetGroup: this.loadBalancedFargateService.targetGroup,
    });

    // Allow VPC to access the service so the NLB health checks work
    this.loadBalancedFargateService.service.connections.allowFrom(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(containerPort),
      "Allow from VPC"
    );

    this.loadBalancedFargateService.targetGroup.configureHealthCheck({
      enabled: true,
      interval: Duration.seconds(10),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      timeout: Duration.seconds(10),
      // path: "/health",
    });

    const scalableTarget = this.loadBalancedFargateService.service.autoScaleTaskCount({
      minCapacity: props.minCapacity ?? 1,
      maxCapacity: props.maxCapacity ?? 1,
    });

    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
    });

    scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 50,
    });
  }
}
