import path from 'path';
import {get} from 'lodash/fp';
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

import {
  format as formatReadme,
  save as saveReadme
} from './lib/readme';

import rc from 'rc';
import requireDir from 'require-dir';

export default async function init(options) {

  options = Object.assign({
    editorConfigPath: path.join(process.cwd(), `.editorconfig`),
    eslintPath: path.join(process.cwd(), `.eslintrc.yml`),
    packagePath: path.join(process.cwd(), `package.json`),
    readmePath: path.join(process.cwd(), `README.md`)
  }, options);

  let pkg = await load(options.packagePath);

  const config = rc(`boilerize`, Object.assign({pkg}, requireDir(`../config`)));

  await configureLintStaged(options, config);
  await configureEditorConfig(options, config);
  await configurePrecommit(options, config);
  await configureEslint(options, config);
  await configureStylelint(options, config);
  pkg = format(config);

  await save(options.packagePath, pkg);

  await configureReadme(options, config);

  await installIfNeeded();
};

async function configureEslint(options, config) {
  if (get(`project.js`, config)) {
    const {eslintPath} = options;
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
      eslintConfig = await eslintLoad(eslintPath);
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
    await eslintSave(eslintPath, eslintConfig);
  }
}

async function configureStylelint(options, config) {
  if (get(`project.css`, config)) {
    await addDevDependency(`pre-commit`, config.pkg);
    await addDevDependency(`lint-staged`, config.pkg);

    await combineScripts(options, `lint`, `lint:css`, config.pkg);

    config.pkg[`lint-staged`][`*.js`] = `lint:css`;
  }
}

async function configurePrecommit(options, config) {
  config.pkg[`pre-commit`] = `lint:staged`;
}

async function configureLintStaged(options, config) {
  await addScript(options, `lint:staged`, `lint-staged`, config.pkg);
  config.pkg[`lint-staged`] = {};
}

async function configureEditorConfig({editorConfigPath}, config) {
  if (!await exists(editorConfigPath)) {
    await writeFile(editorConfigPath, get(`project.editor-config`, config));
  }
}

async function configureReadme({readmePath}, config) {
  const readme = await formatReadme(config);
  await saveReadme(readmePath, readme);
}
