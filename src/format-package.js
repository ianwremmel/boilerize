const _ = require(`lodash/fp`);
const fs = require(`fs`);
const config = require(`./config`);

module.exports = function formatPackage(packagePath) {
  // eslint-disable-next-line global-require
  const pkg = require(packagePath);
  let result = Object.assign({}, config.get(`format-package:defaults`), pkg, config.get(`format-package:overrides`));
  result = config.get(`format-package:order`).reduce(sorter, {});

  const unknownKeys = _.difference(config.get(`format-package:order`), Object.keys(pkg));
  result = unknownKeys.reduce(sorter, result);

  function sorter(acc, key) {
    acc[key] = result[key];
    return acc;
  }

  fs.writeFileSync(packagePath, `${JSON.stringify(result, null, 2)}\n`);
};
