import { DescribeManagedPrefixListsCommand, EC2Client } from "@aws-sdk/client-ec2";

export async function getCloudFrontOriginFacingPrefixListId(region: string): Promise<string> {
    const ec2 = new EC2Client({ region: region });

    const command = new DescribeManagedPrefixListsCommand({
        Filters: [
            {
                Name: 'prefix-list-name',
                Values: ['com.amazonaws.global.cloudfront.origin-facing'],
            },
        ],
    });

    const response = await ec2.send(command);

    const prefixListId = response.PrefixLists?.[0].PrefixListId;
    if (!prefixListId) {
        throw new Error('Could not find CloudFront Origin Facing prefix list ID');
    }

    return prefixListId;
}
