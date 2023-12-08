import * as AWS from "aws-sdk";
import * as fs from "fs";
import { AWSKeys } from "../helpers/common";

const s3bucket = new AWS.S3({
  accessKeyId: AWSKeys.accessKey,
  secretAccessKey: AWSKeys.secretAccessKey,
});

export function uploadToS3(fileName: string): Promise<any> {
  const readStream = fs.createReadStream(fileName);

  const params = {
    Bucket: AWSKeys.packagesBucket,
    Key: fileName,
    Body: readStream,
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, function (err, data) {
      readStream.destroy();

      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}
