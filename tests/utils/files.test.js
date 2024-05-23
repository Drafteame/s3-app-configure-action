import { expect } from 'chai';
import { extractFormat } from '../../src/utils/files.js';

describe('extractFormat', () => {
  it('should return "toml" for .toml files', () => {
    expect(extractFormat('config.toml')).to.equal('toml');
  });

  it('should return "yaml" for .yaml files', () => {
    expect(extractFormat('config.yaml')).to.equal('yaml');
  });

  it('should return "yaml" for .yml files', () => {
    expect(extractFormat('config.yml')).to.equal('yaml');
  });

  it('should return "json" for .json files', () => {
    expect(extractFormat('config.json')).to.equal('json');
  });

  it('should return "json" for .ejson files', () => {
    expect(extractFormat('config.ejson')).to.equal('json');
  });

  it('should throw an error for unsupported file formats', () => {
    expect(() => extractFormat('config.xml')).to.throw(
      'Unsupported file format: xml'
    );
  });

  it('should handle filenames with multiple dots correctly', () => {
    expect(extractFormat('archive.tar.gz.json')).to.equal('json');
  });

  it('should handle filenames with no extension', () => {
    expect(() => extractFormat('config')).to.throw(
      'Unsupported file format: config'
    );
  });
});
