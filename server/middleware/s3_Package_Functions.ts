import * as AWS from "aws-sdk";
import { AWSKeys } from "../helpers/common";
import { IPackageMetadata } from "../models/packagesModel";

const s3bucket = new AWS.S3({
  accessKeyId: AWSKeys.accessKey,
  secretAccessKey: AWSKeys.secretAccessKey,
});

export function uploadToS3(
  buffer: Buffer,
  metadata: IPackageMetadata,
): Promise<AWS.S3.ManagedUpload.SendData> {
  const params: AWS.S3.PutObjectRequest = {
    Bucket: AWSKeys.packagesBucket as string,
    Key: `${Date.now()}-${metadata.Name}-${metadata.Version}.zip`,
    Body: buffer,
    Metadata: {
      Name: metadata.Name as string,
      Version: metadata.Version as string,
      ID: metadata.ID as string,
    },
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, data) => {
      if (err) {
        console.error("error in upload callback");
        reject(err);
      } else {
        console.log("Upload success");
        resolve(data);
      }
    });
  });
}

export function downloadFromS3(key: string): Promise<AWS.S3.GetObjectOutput> {
  const params: AWS.S3.GetObjectRequest = {
    Bucket: AWSKeys.packagesBucket as string,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3bucket.getObject(params, (err, data) => {
      if (err) {
        console.error("error in download callback");
        reject(err);
      } else {
        console.log("Download success");
        resolve(data);
      }
    });
  });
}

export function clearS3Bucket(): Promise<AWS.S3.DeleteObjectsOutput> {
  const params: AWS.S3.ListObjectsV2Request = {
    Bucket: AWSKeys.packagesBucket as string,
  };

  return new Promise((resolve, reject) => {
    s3bucket.listObjectsV2(params, (err, data) => {
      if (err) {
        console.error("error in listObjectsV2 callback");
        reject(err);
      } else {
        console.log("listObjectsV2 success");
        console.log("data", data);
        const deleteParams: AWS.S3.DeleteObjectsRequest = {
          Bucket: AWSKeys.packagesBucket as string,
          Delete: {
            Objects: data.Contents?.map((item) => ({
              Key: item.Key as string,
            })) as AWS.S3.ObjectIdentifierList,
          },
        };
        s3bucket.deleteObjects(deleteParams, (err, data) => {
          if (err) {
            console.error("error in deleteObjects callback");
            reject(err);
          } else {
            console.log("deleteObjects success");
            resolve(data);
          }
        });
      }
    });
  });
}
