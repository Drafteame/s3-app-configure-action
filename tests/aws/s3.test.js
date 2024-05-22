import {
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import * as chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import { Readable } from 'stream';

import Client from '../../src/aws/s3.js';

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('aws/s3 Client class', () => {
  let client;
  let s3ClientStub;
  const accessKey = 'test-access-key';
  const secretKey = 'test-secret-key';
  const region = 'test-region';

  beforeEach(() => {
    client = new Client(accessKey, secretKey, region);
    s3ClientStub = sinon.stub(client.client, 'send');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should check if a bucket exists', async () => {
    const bucketName = 'test-bucket';
    s3ClientStub.resolves({});

    const result = await client.bucketExists(bucketName);

    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(HeadBucketCommand)))
      .to.be.true;
    expect(result).to.be.true;
  });

  it('should return false if the bucket does not exist', async () => {
    const bucketName = 'test-bucket';
    s3ClientStub.rejects({
      name: 'NotFound',
      $metadata: { httpStatusCode: 404 },
    });

    const result = await client.bucketExists(bucketName);

    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(HeadBucketCommand)))
      .to.be.true;
    expect(result).to.be.false;
  });

  it('should throw an error if checking bucket existence fails with an unexpected error', async () => {
    const bucketName = 'test-bucket';
    const error = new Error('Unexpected error');
    s3ClientStub.rejects(error);

    expect(client.bucketExists(bucketName)).to.eventually.be.rejectedWith(
      'Unexpected error'
    );
    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(HeadBucketCommand)))
      .to.be.true;
  });

  it('should check if a file exists', async () => {
    const bucketName = 'test-bucket';
    const filePath = 'test-file.txt';
    s3ClientStub.resolves({});

    const result = await client.fileExists(bucketName, filePath);

    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(HeadObjectCommand)))
      .to.be.true;
    expect(result).to.be.true;
  });

  it('should return false if the file does not exist', async () => {
    const bucketName = 'test-bucket';
    const filePath = 'test-file.txt';
    s3ClientStub.rejects({
      name: 'NotFound',
      $metadata: { httpStatusCode: 404 },
    });

    const result = await client.fileExists(bucketName, filePath);

    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(HeadObjectCommand)))
      .to.be.true;
    expect(result).to.be.false;
  });

  it('should throw an error if checking file existence fails with an unexpected error', async () => {
    const bucketName = 'test-bucket';
    const filePath = 'test-file.txt';
    const error = new Error('Unexpected error');
    s3ClientStub.rejects(error);

    expect(
      client.fileExists(bucketName, filePath)
    ).to.eventually.be.rejectedWith('Unexpected error');
    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(HeadObjectCommand)))
      .to.be.true;
  });

  it('should create a file', async () => {
    const bucketName = 'test-bucket';
    const filePath = 'test-file.txt';
    const fileContent = 'This is a test file content';
    s3ClientStub.resolves({});

    await expect(client.createFile(bucketName, filePath, fileContent)).to.be
      .fulfilled;

    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(PutObjectCommand))).to
      .be.true;
  });

  it('should download a file', async () => {
    const bucketName = 'test-bucket';
    const filePath = 'test-file.txt';
    const fileContent = 'This is a test file content';

    const readable = new Readable();
    readable.push(fileContent);
    readable.push(null);

    s3ClientStub.resolves({ Body: readable });

    const result = await client.downloadFile(bucketName, filePath);

    expect(s3ClientStub.calledOnce).to.be.true;
    expect(s3ClientStub.calledWith(sinon.match.instanceOf(GetObjectCommand))).to
      .be.true;
    expect(result.toString()).to.equal(fileContent);
  });
});
