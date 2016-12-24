import config from './config';
import path from 'path';
import {
  exists,
  writeFile
} from 'fs-promise';

import {
  load as eslintLoad,
  extend,
  save as eslintSave
} from './lib/eslint';

import {
  install
} from './lib/npm';

import {
  addDevDependency,
  addScript,
  combineScripts,
  load,
  save
} from './lib/package';

export default async function init(options) {
  const packagePath = path.join(options.dir, `package.json`);
  const eslintPath = path.join(options.dir, `.eslintrc.yml`);
  const editorConfigPath = path.join(options.dir, `.editorconfig`);

  const pkg = await load(packagePath);
  await addScript(options, `lint:staged`, `lint-staged`, pkg);
  pkg[`pre-commit`] = `lint:staged`;
  pkg[`lint-staged`] = {};

  if (config.get(`project:js`)) {
    await addDevDependency(`pre-commit`, pkg);
    await addDevDependency(`lint-staged`, pkg);
    await addDevDependency(`eslint`, pkg);
    await addDevDependency(`@ianwremmel/eslint-config`, pkg);

    await addScript(options, `lint:eslint`, `eslint --ignore-path .gitignore`, pkg);
    await addScript(options, `lint:js`, `npm run --silent lint:eslint -- .`, pkg);
    await combineScripts(options, `lint`, `lint:js`, pkg);

    pkg[`lint-staged`][`*.js`] = `lint:eslint`;

    let eslintConfig;
    try {
      eslintConfig = await eslintLoad(eslintPath);
    }
    catch (err) {
      eslintConfig = {};
    }
    if (config.get(`project:eslint:imports`)) {
      extend(`@ianwremmel/eslint-config/es2015-imports`, {exclusive: true}, eslintConfig);
    }
    else {
      extend(`@ianwremmel`, {exclusive: true}, eslintConfig);
    }

    if (config.get(`project:react`)) {
      extend(`@ianwremmel/eslint-config/react`, eslintConfig);
    }
    await eslintSave(eslintPath, eslintConfig);
  }

  if (config.get(`project:css`)) {
    await addDevDependency(`pre-commit`, pkg);
    await addDevDependency(`lint-staged`, pkg);

    await combineScripts(options, `lint`, `lint:css`, pkg);

    pkg[`lint-staged`][`*.js`] = `lint:css`;
  }

  await save(packagePath, pkg);

  await install();

  if (!await exists(editorConfigPath)) {
    await writeFile(editorConfigPath, config.get(`project:editor-config`));
  }
};
