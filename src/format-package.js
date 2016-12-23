import _ from 'lodash/fp';
import config from './config';
import {load, save} from './lib/package';

export default async function formatPackage(packagePath) {
  const pkg = await load(packagePath);
  let result = Object.assign({}, config.get(`format-package:defaults`), pkg, config.get(`format-package:overrides`));
  result = config.get(`format-package:order`).reduce(sorter, {});

  const unknownKeys = _.difference(config.get(`format-package:order`), Object.keys(pkg));
  result = unknownKeys.reduce(sorter, result);

  await save(packagePath, result);

  function sorter(acc, key) {
    acc[key] = result[key];
    return acc;
  }
};
