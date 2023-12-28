const core = require('@actions/core');

function main() {
  const filePath = core.getInput('filePath');
  console.log(filePath);
  const packageJson = require(filePath);
  console.log(packageJson);
}

main();
