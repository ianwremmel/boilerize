import path from 'path';
import {spawn} from 'child_process';

import {
  addDevDependency,
  addScript,
  load,
  save
} from './lib/package';

export default async function init(options) {
  const packagePath = path.join(options.dir, `package.json`);
  const pkg = await load(packagePath);

  await addDevDependency(`eslint`, pkg);
  await addDevDependency(`@ianwremmel/eslint-config`, pkg);
  await addDevDependency(`lint-staged`, pkg);
  await addDevDependency(`pre-commit`, pkg);

  await addScript(options, `lint`, `npm run --silent lint:js`, pkg);
  await addScript(options, `lint:eslint`, `eslint --ignore-path .gitignore`, pkg);
  await addScript(options, `lint:js`, `npm run --silent lint:eslint -- .`, pkg);
  await addScript(options, `lint:staged`, `lint-staged`, pkg);

  pkg[`pre-commit`] = `lint:staged`;
  pkg[`lint-staged`] = {
    '*.js': `lint:eslint`
  };

  await save(packagePath, pkg);

  process.stdout.write(`init: installing new packages\n`);

  await new Promise((resolve, reject) => {
    const child = spawn(`npm`, [`install`], {stdio: `inherit`});
    let err = ``;
    child.stderr.on(`data`, (data) => {
      err += data;
    });
    child.on(`close`, (code) => {
      if (code) {
        const error = new Error(err);
        error.code = code;
        reject(error);
        return;
      }
      resolve();
    });
  });

  process.stdout.write(`init: done installing new packages\n`);
};
