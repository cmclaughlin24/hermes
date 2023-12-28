const core = require('@actions/core');
const path = require('path');

/**
 * Yields a boolean indicating if the file extension is `.json`.
 * @param {string} filePath
 * @returns {boolean}
 */
function isJsonFile(filePath) {
  return path.extname(filePath) === '.json';
}

function main() {
  const filePath = core.getInput('filePath');

  if (!isJsonFile(filePath)) {
    throw new Error(
      `Invalid file extension: ${filePath} does not match extension .json`,
    );
  }

  const packageJson = require(filePath);

  if (!packageJson || Object.keys(packageJson).length === 0) {
    throw new Error(
      `Invalid package.json file: package.json file appears to be empty`,
    );
  }

  const version = packageJson['version'];

  if (!version || version.trim() === '') {
    throw new Error(
      'Invalid package.json version: version does not exist or is an empty string',
    );
  }

  core.setOutput('version', version);
}

main();
