const ctrl = {};
const enableDebugLogKey = Symbol('primaryKey');
ctrl[enableDebugLogKey] = false;

function log(...args) {
  ctrl[enableDebugLogKey] && console.log(args);
}

export { log };
