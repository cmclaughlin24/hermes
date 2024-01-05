const core = require('@actions/core');
const { createHash } = require('crypto');

// function toAlphaNumeric(str) {
//   return str.replace(/[^0-9a-zA-Z]+/, '');
// }

function createFileName(content, extension = 'yaml') {
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

async function main() {
  const content = core.getInput('content', { required: true });
  let fileName = core.getInput('fileName');

  if (content.trim() === '') {
    throw new Error('Invalid input: content cannot be an empty string');
  }

  if (!fileName || fileName.trim() === '') {
    core.info('fileName is not present, generating file name hash');

    fileName = createFileName(content);

    core.info(`fileName: ${fileName}`);
  }

  console.log(content);
}

main();
