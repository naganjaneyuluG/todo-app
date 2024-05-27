export const ENV_DEV = 'dev'
export const ENV_QA = 'qa'
export const ENV_STAGING = 'staging'
export const ENV_PROD = 'prod'

export const ENVS = [ENV_DEV, ENV_QA, ENV_STAGING, ENV_PROD] as const
export type DeploymentEnv = typeof ENVS[number]

export const Accounts: Record<DeploymentEnv, { account: string, region: string }> = {
    [ENV_DEV]: { account: '', region: 'ap-south-1' },
    [ENV_QA]: { account: '', region: 'ap-south-1' },
    [ENV_STAGING]: { account: '', region: 'ap-south-1' },
    [ENV_PROD]: { account: '891377034997', region: 'ap-south-1' },
}

export type DeploymentConfigType = {
    mainHostedZoneName: string,
    snAdmin: {
        cpu: number,
        memoryLimitMiB: number,
        minCapacity: number,
        maxCapacity: number,
        desiredCount: number,

    }

}

export const DeploymentConfig: Record<DeploymentEnv, DeploymentConfigType> = {
    [ENV_DEV]: {
        mainHostedZoneName: "dev.sniffynose.com",
        snAdmin: {
            cpu: 256,
            memoryLimitMiB: 512,
            minCapacity: 1,
            maxCapacity: 2,
            desiredCount: 1,
            
        }
    },

    [ENV_QA]: {
        mainHostedZoneName: "qa.sniffynose.com",
        snAdmin: {
            cpu: 256,
            memoryLimitMiB: 512,
            minCapacity: 1,
            maxCapacity: 2,
            desiredCount: 1,
        }
    },

    [ENV_STAGING]: {
        mainHostedZoneName: "staging.sniffynose.com",
        snAdmin: {
            cpu: 256,
            memoryLimitMiB: 512,
            minCapacity: 1,
            maxCapacity: 2,
            desiredCount: 1,
        }
    },

    [ENV_PROD]: {
        mainHostedZoneName: "sniffynose.com",
        snAdmin: {
            cpu: 256,
            memoryLimitMiB: 512,
            minCapacity: 1,
            maxCapacity: 2,
            desiredCount: 1,
        }
    },
}
