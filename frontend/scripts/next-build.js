const fs = require('fs');

const originalReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return originalReadlinkSync.call(this, path, options);
  } catch (error) {
    if (error && error.code === 'EISDIR') {
      return typeof options === 'string' ? path.toString() : path;
    }
    throw error;
  }
};

const originalReadlink = fs.readlink;
fs.readlink = function patchedReadlink(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  return originalReadlink.call(this, path, options, function (error, linkString) {
    if (error && error.code === 'EISDIR') {
      return callback?.(null, typeof options === 'string' ? path.toString() : path);
    }
    return callback?.(error, linkString);
  });
};

const hasCommand = process.argv.slice(2).some((arg) => !arg.startsWith('-'));
if (!hasCommand) {
  process.argv.splice(2, 0, 'build');
}

require('next/dist/bin/next');
