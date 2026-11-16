const fs = require("fs");
const path = require("path");

const shimPath = path.resolve(__dirname, "win-sandbox-realpath.cjs").replace(/\\/g, "/");
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes(shimPath)) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} --require "${shimPath}"`.trim();
}

const origRealpathPromises = fs.promises.realpath.bind(fs.promises);
fs.promises.realpath = async function (p, options) {
  try {
    return await origRealpathPromises(p, options);
  } catch (err) {
    if (err && (err.code === "EPERM" || err.code === "EACCES")) {
      return path.resolve(String(p));
    }
    throw err;
  }
};

const origRealpathSync = fs.realpathSync.bind(fs);
const origRealpathSyncNative = fs.realpathSync.native?.bind(fs.realpathSync);
fs.realpathSync = function (p, options) {
  try {
    return origRealpathSync(p, options);
  } catch (err) {
    if (err && (err.code === "EPERM" || err.code === "EACCES")) {
      return path.resolve(String(p));
    }
    throw err;
  }
};
if (origRealpathSyncNative) {
  fs.realpathSync.native = function (p, options) {
    try {
      return origRealpathSyncNative(p, options);
    } catch (err) {
      if (err && (err.code === "EPERM" || err.code === "EACCES")) {
        return path.resolve(String(p));
      }
      throw err;
    }
  };
}
