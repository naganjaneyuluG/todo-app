// import { Stack, StackProps } from "aws-cdk-lib";
// import { Construct } from "constructs";
// import * as acm from "aws-cdk-lib/aws-certificatemanager";
// import * as route53 from "aws-cdk-lib/aws-route53";

// export interface WildcardCertificateStackProps extends StackProps {
//     hostedZone: route53.IHostedZone,
// }

// export class WildcardCertificateStack extends Stack {
//     readonly acmCertificate: acm.Certificate;

//     constructor(scope: Construct, id: string, props: WildcardCertificateStackProps) {
//         super(scope, id, props);

//         this.acmCertificate = new acm.Certificate(this, "Certificate", {
//             domainName: `*.${props.hostedZone.zoneName}`,
//             subjectAlternativeNames: [
//                 props.hostedZone.zoneName
//             ],
//             validation: acm.CertificateValidation.fromDns(props.hostedZone),
//         });
//     }
// }
