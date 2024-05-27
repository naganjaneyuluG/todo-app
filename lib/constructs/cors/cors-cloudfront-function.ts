import { Construct } from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as path from "path";
import * as fs from "fs";

export interface CorsCloudFrontFunctionProps {
    /**
     * Domains to allow CORS requests from.
     * Supports first-level domains (e.g. `localhost`),
     * and second-level domains (e.g. `example.com`).
     *
     * @example example.com, localhost
     */
    allowedDomains: string[];
}

export class CorsCloudFrontFunction extends Construct {
    readonly cloudFrontFunction: cloudfront.IFunction;

    constructor(scope: Construct, id: string, props: CorsCloudFrontFunctionProps) {
        super(scope, id);

        // Interpolate the allowed domains into the function code,
        // because we can't pass them as environment variables.
        const functionFilePath = path.join(__dirname, "src/index.js");
        const originalFunctionContent = fs.readFileSync(functionFilePath, "utf-8");
        const updatedFunctionContent = originalFunctionContent.replace(
            "/* $ALLOWED_ORIGIN_DOMAINS */",
            JSON.stringify(props.allowedDomains).replace(/[\[\]]/g, ""),
        );

        this.cloudFrontFunction = new cloudfront.Function(this, "CorsCloudFrontFunction", {
            runtime: cloudfront.FunctionRuntime.JS_1_0,
            code: cloudfront.FunctionCode.fromInline(updatedFunctionContent),
        });
    }
}
