import isEmptyInput from 'is-empty-input';

import * as files from './utils/files.js';
import Parser from './parser/index.js';
import Client from './aws/s3.js';

/**
 * Action class that performs the main logic of the action.
 *
 * @property {Object} inputs - The input parameters required for the action.
 * @property {Client} s3 - An S3 client instance.
 * @property {Object} oldConfig - The old configuration object.
 * @property {Object} newConfig - The new configuration object.
 * @property {Parser} oldConfigParser - The parser instance for the old configuration.
 * @property {Parser} newConfigParser - The parser instance for the new configuration.
 */
export default class Action {
  /**
   * Constructor for the Action class.
   * Initializes the class with the provided inputs and validates them.
   * Sets up an S3 client instance using the AWS credentials and region from the inputs.
   * Initializes oldConfig and newConfig objects.
   *
   * @param {Object} inputs - The input parameters required for the action.
   * Fields:
   * {
   *   bucket,
   *   source,
   *   destination,
   *   awsAccessKey,
   *   awsSecretKey,
   *   awsRegion: default = 'us-east-1',
   *   dryRun: default = false,
   * }
   */
  constructor(inputs) {
    this.inputs = inputs;
    this.validateInputs();

    this.s3 = new Client(
      this.inputs.awsAccessKey,
      this.inputs.awsSecretKey,
      this.inputs.awsRegion
    );

    this.oldConfig = {};
    this.newConfig = {};

    this.oldConfigParser = null;
    this.newConfigParser = null;

    this.initParsers();
  }

  /**
   * Executes the main logic of the action.
   * Verifies if the bucket exists, ensures the old configuration is loaded,
   * loads the new configuration, calculates differences, and updates the configuration if not in dry-run mode.
   *
   * @returns {Object} - An object containing the differences between the old and new configurations.
   * Fields:
   * {
   *   added: [
   *     {
   *       key: "...",
   *       value: ...,
   *     }
   *   ],
   *   removed: [
   *     {
   *       key: "...",
   *       value: ...,
   *     }
   *   ],
   *   updated: [
   *     {
   *       key: "...",
   *       oldValue: ...,
   *       newValue: ...,
   *     }
   *   ]
   * }
   */
  async run() {
    await this.verifyIfBucketExists();
    await this.ensureOldConfig();
    this.loadNewConfig();

    const differences = this.getDifferences();

    if (!this.inputs.dryRun) {
      await this.updateConfig();
    }

    return differences;
  }

  /**
   * Updates the configuration file in the S3 bucket with the new configuration.
   *
   * @async
   */
  async updateConfig() {
    await this.s3.createFile(
      this.inputs.bucket,
      this.inputs.destination,
      JSON.stringify(this.newConfig)
    );
  }

  /**
   * Calculates the differences between the old and new configurations.
   * Identifies added, removed, and updated keys.
   *
   * @returns {Object} - An object containing arrays of added, removed, and updated keys.
   */
  getDifferences() {
    const result = {
      added: [],
      removed: [],
      updated: [],
    };

    // Find added and updated keys
    for (const key in this.newConfig) {
      if (!(key in this.oldConfig)) {
        result.added.push({
          key: key,
          value: this.newConfig[key],
        });
      } else if (this.newConfig[key] !== this.oldConfig[key]) {
        result.updated.push({
          key: key,
          oldValue: this.oldConfig[key],
          newValue: this.newConfig[key],
        });
      }
    }

    // Find removed keys
    for (const key in this.oldConfig) {
      if (!(key in this.newConfig)) {
        result.removed.push({
          key: key,
          value: this.oldConfig[key],
        });
      }
    }

    return result;
  }

  /**
   * Ensures the old configuration is loaded from the S3 bucket if it exists.
   *
   * @async
   */
  async ensureOldConfig() {
    let oldConfigExists = await this.s3.fileExists(
      this.inputs.bucket,
      this.inputs.destination
    );

    if (!oldConfigExists) {
      return;
    }

    const content = await this.s3.downloadFile(
      this.inputs.bucket,
      this.inputs.destination
    );

    this.oldConfig = this.oldConfigParser.parse(content.toString());
  }

  /**
   * Verifies if the specified S3 bucket exists.
   * Throws an error if the bucket does not exist.
   *
   * @async
   * @throws {Error} - Throws an error if the bucket does not exist.
   */
  async verifyIfBucketExists() {
    let bucketExists = await this.s3.bucketExists(this.inputs.bucket);

    if (!bucketExists) {
      throw new Error(`Bucket '${this.inputs.bucket}' not exists.`);
    }
  }

  /**
   * Loads the new configuration from the source file.
   */
  loadNewConfig() {
    const content = files.readContent(this.inputs.source);
    this.newConfig = this.newConfigParser.parse(content);
  }

  /**
   * Validates the input parameters to ensure they are not empty.
   *
   * @throws {Error} - Throws an error if any required input is empty.
   */
  validateInputs() {
    Object.keys(this.inputs).forEach((input) => {
      if (input === 'awsRegion') {
        return;
      }

      if (isEmptyInput(this.inputs[input])) {
        throw new Error(`Input '${input}' is empty.`);
      }
    });
  }

  /**
   * Initializes the oldConfigParser and newConfigParser instances based on the source and destination file formats.
   */
  initParsers() {
    const sourceFormat = files.extractFormat(this.inputs.source);
    const destinationFormat = files.extractFormat(this.inputs.destination);

    this.oldConfigParser = new Parser(sourceFormat);
    this.newConfigParser = new Parser(destinationFormat);
  }
}
