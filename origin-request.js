'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const origin = request.origin;

    const host = '<api gateway url>';

    const custom = {
        "domainName": host,
        "keepaliveTimeout": 5,
        "path": "/prod",
        "port": 443,
        "protocol": "https",
        "readTimeout": 5,
        "sslProtocols": [
            "TLSv1",
            "TLSv1.1",
            "TLSv1.2"
        ]
    };

    if (request.method === 'POST') {
        headers['host'] = [{key: 'host', value: host}];
        origin.custom = custom;
        delete origin.s3;
    }

    callback(null, request);
};
