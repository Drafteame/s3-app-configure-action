import core from '@actions/core';

import * as inputs from './src/inputs/index.js';
import Action from './src/action.js';

/**
 * Get the input parameters required for the action.
 * @returns {{bucket: string, awsRegion: string, awsAccessKey: string, dryRun: boolean, destination: string, source: string, awsSecretKey: string}}
 */
const getInputs = () => {
  return {
    bucket: inputs.getString('bucket'),
    source: inputs.getString('source'),
    destination: inputs.getString('destination'),
    awsAccessKey: inputs.getString('aws_access_key'),
    awsSecretKey: inputs.getString('aws_secret_key'),
    awsRegion: inputs.getString('aws_region', 'us-east-1'),
    dryRun: inputs.getBoolean('dry_run', false),
  };
};

/**
 * Print the differences between the old and new configurations.
 * @param diffs
 */
const printDifferences = (diffs) => {
  core.info('Configuration differences');

  diffs.added.forEach((item) => {
    core.info(`[ADDED] ${item.key}: ${item.value}`);
  });

  diffs.removed.forEach((item) => {
    core.info(`[REMOVED] ${item.key}: ${item.value}`);
  });

  diffs.updated.forEach((item) => {
    core.info(`[UPDATED] ${item.key}: ${item.oldValue} => ${item.newValue}`);
  });
};

/**
 * Main function.
 * @returns {Promise<void>}
 */
const main = async () => {
  const action = new Action(getInputs());

  try {
    const diffs = await action.run();
    printDifferences(diffs);
  } catch (err) {
    core.setFailed(`Unexpected error: ${err.message}`);
  }
};

(async function () {
  await main();
})();
