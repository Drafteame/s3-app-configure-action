import * as TOML from 'smol-toml';
import * as YAML from 'yaml';

/**
 * Configuration parser class that provides methods to parse and stringify configuration data.
 *
 * @class Parser
 * @param {string} format - The format of the configuration data.
 * @property {string} format - The format of the configuration data.
 * @property {Object} tokenizer - The tokenizer instance for the specified format.
 */
export default class Parser {
  /**
   * Constructor for the Parser class.
   * Initializes the class with the provided format and sets up the tokenizer instance.
   *
   * @param {string} format - The format of the configuration data.
   */
  constructor(format) {
    this.format = format;
    this.tokenizer = this.getTokenizer();
  }

  /**
   * Obtain the tokenizer instance for the specified format.
   *
   * @returns {{parse: Function, stringify: Function}} - The tokenizer instance for the specified format.
   * @throws {Error} - Unsupported format error.
   */
  getTokenizer() {
    switch (this.format) {
      case 'toml':
        return TOML;
      case 'yaml':
        return YAML;
      case 'json':
        return JSON;
      default:
        throw new Error(`Unsupported format: ${this.format}`);
    }
  }

  /**
   * Parse the provided data using the tokenizer instance.
   *
   * @param {string} data - The configuration data to be parsed.
   * @returns {Object} - The parsed configuration data.
   */
  parse(data) {
    return this.tokenizer.parse(data);
  }

  /**
   * Stringify the provided data using the tokenizer instance.
   *
   * @param {Object} data - The configuration data to be stringified.
   * @returns {string} - The stringified configuration data.
   */
  stringify(data) {
    return this.tokenizer.stringify(data);
  }
}
