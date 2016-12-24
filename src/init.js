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
  addDevDependency,
  addScript,
  combineScripts,
  format,
  installIfNeeded,
  load,
  save
} from './lib/package';

const config = require(`./config`);

export default async function init(options) {
  options = Object.assign({
    packagePath: path.join(options.dir, `package.json`),
    eslintPath: path.join(options.dir, `.eslintrc.yml`),
    editorConfigPath: path.join(options.dir, `.editorconfig`)
  }, options);

  let pkg = await load(options.packagePath);

  pkg = await configureLintStaged(options, pkg);
  pkg = await configureEditorConfig(options, pkg);
  pkg = await configurePrecommit(options, pkg);
  pkg = await configureEslint(options, pkg);
  pkg = await configureStylelint(options, pkg);
  pkg = format(pkg);

  await save(options.packagePath, pkg);

  await installIfNeeded();
};

async function configureEslint(options, pkg) {
  if (config.get(`project:js`)) {
    const {eslintPath} = options;
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
  return pkg;
}

async function configureStylelint(options, pkg) {
  if (config.get(`project:css`)) {
    await addDevDependency(`pre-commit`, pkg);
    await addDevDependency(`lint-staged`, pkg);

    await combineScripts(options, `lint`, `lint:css`, pkg);

    pkg[`lint-staged`][`*.js`] = `lint:css`;
  }
  return pkg;
}

async function configurePrecommit(options, pkg) {
  pkg[`pre-commit`] = `lint:staged`;
  return pkg;
}

async function configureLintStaged(options, pkg) {
  await addScript(options, `lint:staged`, `lint-staged`, pkg);
  pkg[`lint-staged`] = {};
  return pkg;
}

async function configureEditorConfig({editorConfigPath}, pkg) {
  if (!await exists(editorConfigPath)) {
    await writeFile(editorConfigPath, config.get(`project:editor-config`));
  }
  return pkg;
}
