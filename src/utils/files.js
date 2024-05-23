import fs from 'fs';

/**
 * Read file content from a file.
 *
 * @param {string} filePath File path to read content
 * @throws {Error} If file not exists
 * @returns {string} Content of the file
 */
export const readContent = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${filePath} not exists.`);
  }

  const content = fs.readFileSync(filePath, { encoding: 'utf-8' });

  return content.toString();
};

/**
 * Extracts the format of a file based on its extension.
 *
 * @param {string} fileName - The name or path of the file.
 * @returns {string} - The format of the file (e.g., 'toml', 'yaml', 'json').
 * @throws {Error} - Throws an error if the file extension is unsupported.
 */
export const extractFormat = (fileName) => {
  // Extract the file extension
  const fileExtension = fileName.split('.').pop().toLowerCase();

  // Determine the format based on the file extension
  switch (fileExtension) {
    case 'toml':
      return 'toml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'json':
    case 'ejson':
      return 'json';
    default:
      throw new Error(`Unsupported file format: ${fileExtension}`);
  }
};
