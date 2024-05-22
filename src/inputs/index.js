import core from '@actions/core';
import { isEmpty } from '../utils/lo.js';

/**
 * Search and retrieve for a string input, in case that not exists return a default value
 *
 * @param {string} input Name of the input to retrieve
 * @param {string} defaultValue Default string value
 *
 * @returns {string} Value of the input
 */
export const getString = (input, defaultValue = '') => {
  let val = core.getInput(input);

  if (isEmpty(val)) {
    return defaultValue;
  }

  return val;
};

/**
 * Search and retrieve a boolean input, in case that not exists return a default value
 *
 * @param {string} input Name of the input to retrieve
 * @param {boolean} defaultValue Default boolean value
 *
 * @returns {boolean} Value of the input
 */
export const getBoolean = (input, defaultValue = false) => {
  let val = core.getInput(input);

  if (isEmpty(val)) {
    return defaultValue;
  }

  return val.toLowerCase().trim() == 'true';
};

/**
 * Search and retrieve a number input, in case that not exists return a default value
 *
 * @param {string} input Name of the input to retrieve
 * @param {number} defaultValue Default number value
 *
 * @returns {number} Value of the input
 */
export const getNumber = (input, defaultValue = 0) => {
  let val = core.getInput(input);

  if (isEmpty(val)) {
    return defaultValue;
  }

  const parsed = parseFloat(input);

  if (!isNaN(parsed) && parsed.toString() === input) {
    return parsed;
  }

  return defaultValue;
};
