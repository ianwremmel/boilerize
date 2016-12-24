import {
  get,
  isString,
  uniq
} from 'lodash/fp';
import {
  load as loader,
  save as saver
} from './fs';
import {
  addDevDependency,
  addScript,
  combineScripts
} from './package';

const FILENAME = `.eslintrc.yml`;

export const load = loader(FILENAME);
export const save = saver(FILENAME);

export default async function setupEslint(options, config) {
  if (get(`project.js`, config)) {
    await addDevDependency(`pre-commit`, config.pkg);
    await addDevDependency(`lint-staged`, config.pkg);
    await addDevDependency(`eslint`, config.pkg);
    await addDevDependency(`@ianwremmel/eslint-config`, config.pkg);

    await addScript(options, `lint:eslint`, `eslint --ignore-path .gitignore`, config.pkg);
    await addScript(options, `lint:js`, `npm run --silent lint:eslint -- .`, config.pkg);
    await combineScripts(options, `lint`, `lint:js`, config.pkg);

    config.pkg[`lint-staged`][`*.js`] = `lint:eslint`;

    let eslintConfig;
    try {
      eslintConfig = await load();
    }
    catch (err) {
      eslintConfig = {};
    }
    if (get(`project.eslint.imports`, config)) {
      extend(`@ianwremmel/eslint-config/es2015-imports`, {exclusive: true}, eslintConfig);
    }
    else {
      extend(`@ianwremmel`, {exclusive: true}, eslintConfig);
    }

    if (get(`project.react`, config)) {
      extend(`@ianwremmel/eslint-config/react`, eslintConfig);
    }
    await save(eslintConfig);
  }
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
