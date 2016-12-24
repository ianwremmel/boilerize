import {get} from 'lodash/fp';

import setupEslint from './lib/eslint';

import setupPackage, {
  addDevDependency,
  combineScripts,
  format,
  installIfNeeded,
  load as loadPackage,
  save as savePackage
} from './lib/package';
import setupReadme from './lib/readme';
import setupEditorConfig from './lib/editorconfig';
import rc from 'rc';
import requireDir from 'require-dir';

export default async function init(options) {
  let pkg = await loadPackage();

  const config = rc(`boilerize`, Object.assign({pkg}, requireDir(`../config`)));

  await setupPackage(options, config);
  await setupEditorConfig(options, config);
  await setupEslint(options, config);
  await configureStylelint(options, config);
  pkg = format(config);

  await savePackage(pkg);

  await setupReadme(options, config);

  await installIfNeeded();
}

async function configureStylelint(options, config) {
  if (get(`project.css`, config)) {
    await addDevDependency(`pre-commit`, config.pkg);
    await addDevDependency(`lint-staged`, config.pkg);

    await combineScripts(options, `lint`, `lint:css`, config.pkg);

    config.pkg[`lint-staged`][`*.js`] = `lint:css`;
  }
}
