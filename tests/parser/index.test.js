import { expect } from 'chai';
import * as TOML from 'smol-toml';
import * as YAML from 'yaml';

import Parser from '../../src/parser/index.js';

describe('Parser Class', () => {
  describe('Constructor', () => {
    it('should initialize with format toml and set the correct tokenizer', () => {
      const parser = new Parser('toml');
      expect(parser.format).to.equal('toml');
      expect(parser.tokenizer).to.equal(TOML);
    });

    it('should initialize with format yaml and set the correct tokenizer', () => {
      const parser = new Parser('yaml');
      expect(parser.format).to.equal('yaml');
      expect(parser.tokenizer).to.equal(YAML);
    });

    it('should initialize with format json and set the correct tokenizer', () => {
      const parser = new Parser('json');
      expect(parser.format).to.equal('json');
      expect(parser.tokenizer).to.equal(JSON);
    });

    it('should throw an error for unsupported format', () => {
      expect(() => new Parser('xml')).to.throw('Unsupported format: xml');
    });
  });

  describe('getTokenizer method', () => {
    it('should return TOML tokenizer for toml format', () => {
      const parser = new Parser('toml');
      expect(parser.getTokenizer()).to.equal(TOML);
    });

    it('should return YAML tokenizer for yaml format', () => {
      const parser = new Parser('yaml');
      expect(parser.getTokenizer()).to.equal(YAML);
    });

    it('should return JSON tokenizer for json format', () => {
      const parser = new Parser('json');
      expect(parser.getTokenizer()).to.equal(JSON);
    });

    it('should throw an error for unsupported format', () => {
      expect(() => {
        new Parser('xml');
      }).to.throw('Unsupported format: xml');
    });
  });

  describe('parse method', () => {
    it('should correctly parse TOML data', () => {
      const parser = new Parser('toml');
      const tomlData = 'key = "value"';
      const expectedData = { key: 'value' };

      const result = parser.parse(tomlData);
      expect(result).to.deep.equal(expectedData);
    });

    it('should correctly parse YAML data', () => {
      const parser = new Parser('yaml');
      const yamlData = 'key: value';
      const expectedData = { key: 'value' };

      const result = parser.parse(yamlData);
      expect(result).to.deep.equal(expectedData);
    });

    it('should correctly parse JSON data', () => {
      const parser = new Parser('json');
      const jsonData = '{"key": "value"}';
      const expectedData = { key: 'value' };

      const result = parser.parse(jsonData);
      expect(result).to.deep.equal(expectedData);
    });
  });

  describe('stringify method', () => {
    it('should correctly stringify TOML data', () => {
      const parser = new Parser('toml');
      const data = { key: 'value' };
      const expectedTomlData = 'key = "value"';

      const result = parser.stringify(data);
      expect(result).to.equal(expectedTomlData);
    });

    it('should correctly stringify YAML data', () => {
      const parser = new Parser('yaml');
      const data = { key: 'value' };
      const expectedYamlData = 'key: value\n';

      const result = parser.stringify(data);
      expect(result).to.equal(expectedYamlData);
    });

    it('should correctly stringify JSON data', () => {
      const parser = new Parser('json');
      const data = { key: 'value' };
      const expectedJsonData = '{"key":"value"}';

      const result = parser.stringify(data);
      expect(result).to.equal(expectedJsonData);
    });
  });
});
