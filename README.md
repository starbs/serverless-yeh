Starbs Yeh - Serverless Edition (AWS)
==========

**Starbs Image Service!**

*The* ShareX Custom Image Uploader

## Migration

Migrate from `starbs/yeh` with the included Python script.
Run `python migrate.py <database name> <target S3 bucket name>` from the machine MySQL was installed _(with an authenticated `awscli`)_.

## Installation

- Clone the repository.
- Run `npm install`.
- Create an S3 bucket and change the variable in `serverless.yml`.
- Run `sls deploy`.

At this stage, you have a working API, the URL returned by Serverless can be used to POST images.

If you would like to GET images with the API *(not recommended)*, uncomment the HTTP event in `serverless.yml` for path proxy requests.

We recommend putting the API behind a custom URL. For the purposes of the following steps we will use `i.example.org` as our example host.
The following steps will eventually be automated in a later version.

- Create 2 Lambda functions in `us-east-1` using the `origin-request.js` and `viewer-request.js` as source files.
- Request a certificate for `i.example.org` in ACM.
- Create a CloudFront distribution, setting the alternate domain name as `i.example.org`, selecting the SSL certificate we requested.
- Set up an S3 origin for your distribution pointing to the bucket you created earlier, ensuring you restrict bucket access, allow CloudFront to create a new origin access identity and update your bucket permissions.
- Set the default behavior to redirect HTTP to HTTPS, allow all HTTP methods and associate the two Lambda functions as named.
- Point the CNAME record of `i.example.org` in DNS to your CloudFront distribution's domain name.

We're set, once the CloudFront distribution is deployed. Images can be POSTed as part of a multipart form with `image` as the form key.

Images can also be posted as a binary payload in the request body.

The API will return a JSON response in the event of an error, or a plaintext string indicating the destination URL for the image in the event of a success.

## Usage

Modify the configuration files in *'config'*, then follow the setup in ShareX Destination Settings as shown below:

![](https://i.imgur.com/wv31UB8.png)

Sidenote: *We suggest configuring a keybind to upload your clipboard (Chip uses Ctrl-Shift-\\) this will allow you to copy and instantly upload any image*

## Notes

- The maximum payload to API Gateway is 10MB and 6MB to Lambda, so our uploads are limited to 6MB.
- I suggest putting a rate limiting WAF on the CloudFront distribution to prevent cost attacks, the minimum rate-limit in WAF is 2000 requests every 5 minutes (more than enough). If an actor decides to try and attack your API and hit the maximum rate limits for 24 hours, it'd only cost around $6; while this is an unlikely scenario, if you would like to protect your API, keys can be enabled for API Gateway endpoints.

## License

Starbs Yeh - Serverless Edition is licensed under [The MIT License (MIT)](LICENSE).
