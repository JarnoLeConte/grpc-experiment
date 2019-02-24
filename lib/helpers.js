const { callbackify } = require('util');

function callbackifyAll(promosifiedFunctions) {
  return Object.entries(promosifiedFunctions)
    .reduce((obj, [name, func]) => Object.assign(obj, { [name]: callbackify(func) }), {});
}

module.exports = {
  callbackifyAll,
};
