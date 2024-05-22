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
