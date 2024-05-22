import {
  S3Client,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

export default class Client {
  /**
   * Creates an instance of the S3 client.
   *
   * @param {string} accessKey - Your AWS access key.
   * @param {string} secretKey - Your AWS secret key.
   * @param {string} region - The AWS region where your S3 bucket is located.
   */
  constructor(accessKey, secretKey, region) {
    this.client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  /**
   * Checks if a bucket exists in S3.
   *
   * @param {string} bucket - The name of the bucket.
   * @returns {Promise<boolean>} - A promise that resolves to true if the bucket exists, otherwise false.
   */
  async bucketExists(bucket) {
    const command = new HeadBucketCommand({
      Bucket: bucket,
    });

    try {
      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || this.#getErrStatusCode(error) === 404) {
        return false;
      }

      throw error;
    }
  }

  /**
   * Checks if a file exists in a specified S3 bucket.
   *
   * @param {string} bucket - The name of the bucket.
   * @param {string} filePath - The path to the file within the bucket.
   * @returns {Promise<boolean>} - A promise that resolves to true if the file exists, otherwise false.
   */
  async fileExists(bucket, filePath) {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: filePath,
    });

    try {
      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || this.#getErrStatusCode(error) === 404) {
        return false;
      }

      throw error;
    }
  }

  /**
   * Creates a new file or updates an existing file in a specified S3 bucket.
   *
   * @param {string} bucket - The name of the bucket.
   * @param {string} filePath - The path to the file within the bucket.
   * @param {string|Uint8Array|Buffer} content - The content to be written to the file.
   * @returns {Promise<void>} - A promise that resolves when the file is successfully created or updated.
   */
  async createFile(bucket, filePath, content) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filePath,
      Body: content,
    });

    await this.client.send(command);
  }

  #getErrStatusCode(err) {
    if (err.$metadata && err.$metadata.httpStatusCode) {
      return err.$metadata.httpStatusCode;
    }

    return null;
  }

  /**
   * Downloads a file from a specified S3 bucket.
   *
   * @param {string} bucket - The name of the bucket.
   * @param {string} filePath - The path to the file within the bucket.
   * @returns {Promise<Uint8Array>} - A promise that resolves to the file content as a Uint8Array.
   */
  async downloadFile(bucket, filePath) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: filePath,
    });

    const { Body } = await this.client.send(command);
    const chunks = [];

    for await (const chunk of Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}
