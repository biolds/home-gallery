const path = require('path');

const log = require('@home-gallery/logger')('index.create');

const walk = require('./walker');

const createFilesMapper = (excludeIfPresent) => {
  if (!excludeIfPresent) {
    return (files) => files;
  }

  return (files) => {
    const hasExcludeFile = files.indexOf(excludeIfPresent) < 0;
    return hasExcludeFile ? files : [];
  }
}

const createIndex = (dir, options, cb) => {
  const entries = [];
  const t0 = Date.now();
  walk(dir, createFilesMapper(options.exludeIfPresent), (filename, stat) => {
    const relativeFilename = path.relative(dir, filename);
    if (!options.filter(relativeFilename)) {
      return false;
    }
    entries.push(Object.assign({}, stat, {
      filename: relativeFilename,
      sha1sum: '',
      sha1sumDate: null,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      isSymbolicLink: stat.isSymbolicLink(),
      isOther: !stat.isFile() && !stat.isDirectory() && !stat.isSymbolicLink(),
      fileType: stat.isDirectory() ? 'd' : (stat.isFile() ? 'f' : (stat.isSymbolicLink() ? 'l' : 'o'))
    }));
    return true;
  }, (err) => {
    if (err) {
      log.err(`Could not read files in ${dir}: ${err}`);
      return cb(err);
    } 
    log.info(t0, `Read ${entries.length} files in ${dir}`);
    cb(null, entries);
  });
}

module.exports = createIndex;
