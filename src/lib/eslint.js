import jsyaml from 'js-yaml';
import {
  readFile,
  writeFile
} from 'fs-promise';

import {
  isString,
  uniq
} from 'lodash/fp';

export async function save(configPath, config) {
  await writeFile(configPath, jsyaml.safeDump(config));
}

export async function load(configPath) {
  return jsyaml.safeLoad(await readFile(configPath));
}

export function extend(rule, options, config) {
  if (!config) {
    config = options;
    options = undefined;
  }

  if (options.exclusive) {
    config.extends = rule;
    return config;
  }

  if (!config) {
    config = {};
  }

  if (isString(config.extends)) {
    config.extends = [
      config.extends,
      rule
    ];
    return config;
  }

  config.extends = config.extends || [];

  config.extends.push(rule);
  config.extends = uniq(config.extends);
  return config;
}
