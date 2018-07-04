const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

module.exports = function createS3() {
    const s3 = new AWS.S3();
    const myBucket = 'my-bucket-service';

    async function putObject(filePath) {
        try {
            const file = await fs.readFileSync(filePath);
            const data = new Buffer(file);
            s3.putObject({
                Bucket: myBucket,
                Key: path.basename(filePath),
                Body: data,
                ACL: 'public-read'
            }, function (response) {
                console.log(response);
            });
        } catch (e) {
            console.log(e);
        }
    }
  return {putObject};
};



