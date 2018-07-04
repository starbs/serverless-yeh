/*eslint strict: ["error", "global"]*/

'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fileType = require('file-type');
const sha1 = require('sha1');
const q = require('kew');
const validator = require('validator');
const multipart = require('parse-multipart');
var Hashids = require('hashids');
var hashids = new Hashids('yeh', 5);

module.exports.image = (event, context, callback) => {

  function upload(key, data, type) {
    var defer = q.defer();
    const s3Params = {
      Bucket: process.env.BUCKET,
      Key: key,
      ACL: 'public-read',
      Body: data,
      ContentType: type
    };
    s3.putObject(s3Params, defer.makeNodeResolver());
    return defer.promise;
  }

  function download(key) {
    var defer = q.defer();
    const s3Params = {
      Bucket: process.env.BUCKET,
      Key: key
    }
    s3.getObject(s3Params, defer.makeNodeResolver()); 
    return defer.promise;
  }

  if (event.httpMethod === 'POST') {
    let b64 = Buffer.from(event.body, 'base64').toString()
    let data = Buffer.from(event.body, 'base64').toString('binary');
    let image = Buffer.from(data, 'binary');
    if (event.headers['content-type'].split(';')[0] === 'multipart/form-data') {
      let boundary = multipart.getBoundary(event.headers['content-type']);
      let parts = multipart.Parse(bin, boundary);
      image = parts[0]['data'];
    }
    let type = fileType(image);
    let imgStr = Buffer.from(event.body, 'base64').toString('ascii');
    let imgHex = sha1(imgStr).toString('hex');
    let hash = hashids.encodeHex(imgHex.substring(0, 5));
    console.log(hash);
    upload(hash, image, type.mime)
      .then(function(res) {
        const response = {
          statusCode: 201,
          headers: {
            'Content-Type': 'text/plain'
          },
          body: process.env.URL + hash
        }
        callback(null, response);
      })
      .fail(function(err) {
        const failure = {
          "error": "Failure uploading object",
          "response": err
        }
        console.log(failure);
        const response = {
          statusCode: 500,
          body: JSON.stringify(failure)
        };
        callback(null, response);
      });
  } else if (event.httpMethod === 'GET') {
    if (!validator.isAlphanumeric(event.path.substring(1))) {
      const response = {
        statusCode: 400
      };
      console.log(event.path.substring(1));
      callback(null, response);
    } else {
      download(event.path.substring(1))
        .then(function(data) {
          console.log(data);
          const response = {
            statusCode: 200,
            body: Buffer.from(data['Body'], 'binary').toString('base64'),
            headers: {
              'Content-Type': data['ContentType']
            },
            isBase64Encoded: true
          };
          callback(null, response)
        })
        .fail(function(err) {
          console.log(failure);
          const failure = {
            "error": "Failure downloading object",
            "response": err
          }
          const response = {
            statusCode: 500,
            body: JSON.stringify(failure)
          };
          callback(null, response);
        });
    }
  } else {
    const response = {
      statusCode: 405
    };
    callback(null, response);
  }
}
