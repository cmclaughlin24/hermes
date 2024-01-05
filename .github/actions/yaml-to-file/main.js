const core = require('@actions/core');
const { createHash } = require('crypto');

async function createFileName(content, extension = 'yaml') {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');

    hash.on('readable', () => {
      const data = hash.read();

      if (!data) {
        reject('Failed to generate file hash, null was read from buffer');
      }

      resolve(`${data}.${extension}`);
    });

    hash.write(content);
    hash.end();
  });
}

async function main() {
  const content = core.getInput('content', { required: true });
  let fileName = core.getInput('fileName');

  if (content.trim() === '') {
    throw new Error('Invalid input: content cannot be an empty string');
  }

  if (!fileName || fileName.trim() === '') {
    core.info('fileName is not present, generating file name hash');

    fileName = await createFileName(content);

    core.info(`fileName: ${content}`);
  }

  console.log(content)
}

main();
