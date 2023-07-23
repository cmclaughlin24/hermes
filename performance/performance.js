const crypto = require('crypto');

function generateUUID(requestParams, context, eventEmitter, next) {
  context.vars.uuid = crypto.randomUUID();
  next();
}

module.exports = {
  generateUUID: generateUUID,
};
