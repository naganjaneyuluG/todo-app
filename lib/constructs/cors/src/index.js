function responseBadRequest(message) {
    return {
        statusCode: 400,
        statusDescription: 'Bad Request',
        headers: {
            'x-op3n-error': { value: message },
        },
    };
}

function isCorsPreflightRequest(request) {
    var method = request.method;
    if (method !== 'OPTIONS') {
        return false;
    }

    var origin = request.headers['origin'];
    if (!origin || !origin.value || origin.value === 'null') {
        return false;
    }

    var accessControlRequestMethod = request.headers['access-control-request-method'];
    if (!accessControlRequestMethod || !accessControlRequestMethod.value) {
        return false;
    }

    return true;
}

/**
 * CloudFront Function to handle CORS preflight requests.
 * It must be ES5.1 compliant, so we can't use modern JavaScript features.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/CORS
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin
 * @see https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
 * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-10.html
 */
function handler(event) {
    var request = event.request;

    if (!isCorsPreflightRequest(request)) {
        // Do not process non-CORS requests, so proceed to origin
        return request;
    }

    var allowedOriginDomains = [
        // Allowed origin domains will be interpolated here by CDK
        /* $ALLOWED_ORIGIN_DOMAINS */
    ];

    var supportedOriginProtos = [
        'http',
        'https',
    ];

    var origin = request.headers['origin'].value;
    var originProto = origin.split('://')[0];
    if (supportedOriginProtos.indexOf(originProto) === -1) {
        return responseBadRequest('Invalid origin protocol');
    }

    var originHostnameAndOptionalPort = origin.split('://')[1];
    if (!originHostnameAndOptionalPort) {
        return responseBadRequest('Invalid origin');
    }

    var originHostname = originHostnameAndOptionalPort.split(':')[0];
    if (!originHostname) {
        return responseBadRequest('Invalid origin hostname');
    }

    var originDomain = originHostname.split('.').slice(-2).join('.');
    if (!originDomain) {
        return responseBadRequest('Invalid origin domain');
    }

    if (allowedOriginDomains.indexOf(originDomain) !== -1) {
        return {
            statusCode: 200,
            statusDescription: 'OK',
            headers: {
                'allow': { value: 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE' },
                'cache-control': { value: 'max-age=60' },
                'access-control-allow-origin': { value: origin },
                'access-control-allow-methods': { value: 'OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE' },
                'access-control-allow-headers': { value: 'Authorization, Accept, Content-Type, Range' },
                'access-control-max-age': { value: '60' },
                'access-control-allow-credentials': { value: 'true' },
            },
        };
    }

    return responseBadRequest('Origin not allowed');
}
