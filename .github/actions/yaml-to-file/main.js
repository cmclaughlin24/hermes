const core = require('@actions/core');
const { createHash } = require('crypto');
const { extname } = require('path');
const fs = require('fs');

function createFileName(content) {
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
  }

  const extension = extname(fileName);

  if (extension !== '.yaml' && extension !== '') {
    throw new Error('Invalid input: fileName must have an extension of .yaml');
  }

  if (extension === '') {
    core.info('.yaml is not present, appending extension');
    fileName += '.yaml';
  }

  core.info(`fileName: ${fileName}`);

  fs.writeFileSync(fileName, content);
  console.log(process.cwd())
}

main();
