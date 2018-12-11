const AWS = require('aws-sdk');

module.exports = function createS3(bucket) {
  const s3 = new AWS.S3();
  const Bucket = bucket;

  async function putObject(file, filename) {
    return new Promise((resolve, reject) => {
      s3.putObject({
        Bucket,
        Key: filename,
        Body: file,
        ACL: 'public-read'
      }, function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    })
  }

  async function getUrl(Key) {
    return s3.getSignedUrl('getObject', {Bucket, Key})
  }

  async function getObject(Key) {
    return new Promise((resolve, reject) => {
      s3.getObject({Bucket, Key}, function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      })
    })
  }

  return {putObject, getUrl, getObject};
};



