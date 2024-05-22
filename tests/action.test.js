import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import * as chai from 'chai';
import fs from 'fs';

import Action from '../src/action.js';
import Client from '../src/aws/s3.js';

// Use chai-as-promised
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('src Action class', () => {
  let s3Stub, inputs, action;

  let sandbox;
  let fsReadFileSyncStub, fsExistsSyncStub;

  beforeEach(() => {
    inputs = {
      bucket: 'test-bucket',
      source: 'test-source.json',
      destination: 'test-destination.json',
      awsAccessKey: 'test-access-key',
      awsSecretKey: 'test-secret-key',
      awsRegion: 'us-east-1',
      dryRun: false,
    };

    sandbox = sinon.createSandbox();

    // Stub the S3 Client methods
    s3Stub = sandbox.createStubInstance(Client);

    action = new Action(inputs);
    action.s3 = s3Stub;

    fsReadFileSyncStub = sandbox.stub(fs, 'readFileSync');
    fsExistsSyncStub = sandbox.stub(fs, 'existsSync');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should initialize the Action class with valid inputs', () => {
    const action = new Action(inputs);
    expect(action.inputs).to.deep.equal(inputs);
    expect(action.s3).to.be.an.instanceof(Client);
    expect(action.oldConfig).to.be.an('object');
    expect(action.newConfig).to.be.an('object');
  });

  it('should throw an error if any required input is empty', () => {
    inputs.bucket = '';
    expect(() => new Action(inputs)).to.throw("Input 'bucket' is empty.");
  });

  it('should return the differences between old and new configurations', async () => {
    action.oldConfig = { key1: 'value1' };
    action.newConfig = { key2: 'value2' };

    s3Stub.bucketExists.resolves(true);
    s3Stub.fileExists.resolves(true);
    s3Stub.downloadFile.resolves(JSON.stringify({ key1: 'value1' }));

    fsExistsSyncStub.returns(true);
    fsReadFileSyncStub.returns({
      toString: () => JSON.stringify({ key2: 'value2' }),
    });

    const differences = await action.run();

    expect(differences).to.deep.equal({
      added: [{ key: 'key2', value: 'value2' }],
      removed: [{ key: 'key1', value: 'value1' }],
      updated: [],
    });
  });

  it('should not update the configuration if dryRun is true', async () => {
    action.inputs.dryRun = true;
    action.oldConfig = { key1: 'value1' };
    action.newConfig = { key2: 'value2' };

    s3Stub.bucketExists.resolves(true);
    s3Stub.fileExists.resolves(true);
    s3Stub.downloadFile.resolves(JSON.stringify({ key1: 'value1' }));

    fsExistsSyncStub.returns(true);
    fsReadFileSyncStub.returns({
      toString: () => JSON.stringify({ key2: 'value2' }),
    });

    const differences = await action.run();

    expect(s3Stub.createFile.called).to.be.false;
    expect(differences).to.deep.equal({
      added: [{ key: 'key2', value: 'value2' }],
      removed: [{ key: 'key1', value: 'value1' }],
      updated: [],
    });
  });

  it('should throw an error if the bucket does not exist', async () => {
    action.oldConfig = { key1: 'value1' };
    action.newConfig = { key2: 'value2' };

    s3Stub.bucketExists.resolves(false);

    expect(action.run()).to.eventually.be.rejectedWith(
      "Bucket 'test-bucket' not exists."
    );
  });

  it('should update the configuration file in the S3 bucket', async () => {
    action.newConfig = { key2: 'value2' };

    await action.updateConfig();

    expect(s3Stub.createFile.calledOnce).to.be.true;
    expect(
      s3Stub.createFile.calledWith(
        'test-bucket',
        'test-destination.json',
        JSON.stringify({ key2: 'value2' })
      )
    ).to.be.true;
  });

  it('should calculate the differences between old and new configurations', () => {
    action.oldConfig = { key1: 'value1' };
    action.newConfig = { key2: 'value2', key1: 'value1-updated' };

    const differences = action.getDifferences();

    expect(differences).to.deep.equal({
      added: [{ key: 'key2', value: 'value2' }],
      removed: [],
      updated: [
        { key: 'key1', oldValue: 'value1', newValue: 'value1-updated' },
      ],
    });
  });

  it('should load the old configuration if it exists', async () => {
    s3Stub.fileExists.resolves(true);
    s3Stub.downloadFile.resolves(JSON.stringify({ key1: 'value1' }));

    await action.ensureOldConfig();

    expect(action.oldConfig).to.deep.equal({ key1: 'value1' });
  });

  it('should not load the old configuration if it does not exist', async () => {
    s3Stub.fileExists.resolves(false);

    await action.ensureOldConfig();

    expect(action.oldConfig).to.deep.equal({});
  });

  it('should throw an error if the bucket does not exist', async () => {
    s3Stub.bucketExists.resolves(false);

    expect(action.verifyIfBucketExists()).to.eventually.be.rejectedWith(
      "Bucket 'test-bucket' not exists."
    );
  });

  it('should not throw an error if the bucket exists', async () => {
    s3Stub.bucketExists.resolves(true);

    expect(action.verifyIfBucketExists()).to.eventually.be.fulfilled;
  });

  it('should throw an error if any required input is empty', () => {
    inputs.bucket = '';
    expect(() => new Action(inputs)).to.throw("Input 'bucket' is empty.");
  });

  it('should not throw an error if awsRegion is missing', () => {
    delete inputs.awsRegion;
    expect(() => new Action(inputs)).not.to.throw();
  });
});
