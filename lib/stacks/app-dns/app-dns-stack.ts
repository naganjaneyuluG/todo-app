// import { Stack, StackProps } from "aws-cdk-lib";
// import * as route53 from "aws-cdk-lib/aws-route53";
// import { Construct } from "constructs";

// export interface openSuperAppShopDnsStackProps extends StackProps {
//     openMainHostedZoneName: string,
// }

// export class openSuperAppShopDnsStack extends Stack {
//     readonly openMainHostedZone: route53.HostedZone;

//     constructor(scope: Construct, id: string, props: openSuperAppShopDnsStackProps) {
//         super(scope, id, props);

//         this.openMainHostedZone = new route53.HostedZone(this, "openSuperAppShopMainHostedZone", {
//             zoneName: props.openMainHostedZoneName,
//         });
//     }
// }
