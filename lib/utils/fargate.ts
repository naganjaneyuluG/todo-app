import { CapacityProviderStrategy } from "aws-cdk-lib/aws-ecs";


export const CapacityProviderStrategies = {
    FargateOnly: [{
        capacityProvider: 'FARGATE',
        weight: 1,
    }],

    FargateSpotOnly: [{
        capacityProvider: 'FARGATE_SPOT',
        weight: 1,
    }],

    Equal: [{
        capacityProvider: 'FARGATE',
        weight: 1,
    }, {
        capacityProvider: 'FARGATE_SPOT',
        weight: 1,
    }],
} satisfies Record<string, CapacityProviderStrategy[]>;
