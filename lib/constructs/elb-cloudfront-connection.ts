import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as lb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { BehaviorOptions } from "aws-cdk-lib/aws-cloudfront/lib/distribution";
import { CorsCloudFrontFunction } from "./cors/cors-cloudfront-function";
import * as cdk from 'aws-cdk-lib';


export interface ElbCloudFrontConnectionProps {
    fqdn?: string,
    hostedZone?: route53.IHostedZone,
    subdomain?: string,

    certificate?: acm.ICertificate,

    elb: lb.NetworkLoadBalancer | lb.ApplicationLoadBalancer,
    elbProtocolPolicy: cloudfront.OriginProtocolPolicy,

    cloudFrontBehaviorOptions?: Partial<cloudfront.BehaviorOptions>,
    cloudFrontOptions?: cloudfront.DistributionProps,
    additionalBehaviors?: Record<string, BehaviorOptions>;
    corsAllowedDomains?: string[];
}

export class ElbCloudFrontConnection extends Construct {
    readonly cloudFrontFqdn: string | undefined;
    readonly cloudFrontDistribution: cloudfront.IDistribution;
    readonly cloudFrontDistributionRecord: route53.IRecordSet;

    constructor(scope: Construct, id: string, props: ElbCloudFrontConnectionProps) {
        super(scope, id);

        this.cloudFrontFqdn = this.getFqdn(props);

        let corsRelatedOptions = {};
        if (props.corsAllowedDomains?.length) {
            corsRelatedOptions = {
                functionAssociations: [{
                    eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
                    function: new CorsCloudFrontFunction(this, 'CorsCloudFrontFunction', {
                        allowedDomains: props.corsAllowedDomains,
                    }).cloudFrontFunction,
                }]
            };
        }

        this.cloudFrontDistribution = new cloudfront.Distribution(this, 'Distribution', {
            certificate: props.certificate,
            defaultBehavior: {
                origin: new origins.LoadBalancerV2Origin(props.elb, {
                    protocolPolicy: props.elbProtocolPolicy,
                    readTimeout: cdk.Duration.seconds(60),
                }),
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,

                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
                compress: true,

                cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT,

                ...corsRelatedOptions,
                ...props.cloudFrontBehaviorOptions,
            },
            additionalBehaviors: props.additionalBehaviors,
            ...(this.cloudFrontFqdn && { domainNames: [this.cloudFrontFqdn] }),
            ...props.cloudFrontOptions,
        })

        if (props.hostedZone && props.subdomain) {
            this.cloudFrontDistributionRecord = new route53.CnameRecord(this, 'DistributionRecord', {
                zone: props.hostedZone,
                recordName: `${props.subdomain}.${props.hostedZone.zoneName}`,
                domainName: this.cloudFrontDistribution.distributionDomainName,
            })
        }
    }

    getFqdn(props: ElbCloudFrontConnectionProps): string | undefined {
        let fqdn

        if (!fqdn && props.fqdn) {
            fqdn = props.fqdn
        }

        if (!fqdn && props.hostedZone && props.subdomain) {
            fqdn = `${props.subdomain}.${props.hostedZone.zoneName}`
        }

        if (!fqdn && props.hostedZone) {
            fqdn = `${props.hostedZone.zoneName}`
        }

        return fqdn
    }
}
