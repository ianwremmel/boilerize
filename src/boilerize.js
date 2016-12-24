import path from 'path';
import {get} from 'lodash/fp';
import {
  exists,
  writeFile
} from 'fs-promise';

import setupEslint from './lib/eslint';

import setupPackage, {
  addDevDependency,
  combineScripts,
  format,
  installIfNeeded,
  load,
  save
} from './lib/package';

import setupReadme from './lib/readme';

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

  await setupPackage(options, config);
  await configureEditorConfig(options, config);
  await setupEslint(options, config);
  await configureStylelint(options, config);
  pkg = format(config);

  await save(options.packagePath, pkg);

  await setupReadme(options, config);

  await installIfNeeded();
};

async function configureStylelint(options, config) {
  if (get(`project.css`, config)) {
    await addDevDependency(`pre-commit`, config.pkg);
    await addDevDependency(`lint-staged`, config.pkg);

    await combineScripts(options, `lint`, `lint:css`, config.pkg);

    config.pkg[`lint-staged`][`*.js`] = `lint:css`;
  }
}

async function configureEditorConfig({editorConfigPath}, config) {
  if (!await exists(editorConfigPath)) {
    await writeFile(editorConfigPath, get(`project.editor-config`, config));
  }
}
