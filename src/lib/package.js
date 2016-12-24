import {difference, uniq} from 'lodash';
import {writeFile} from 'fs-promise';
import {exec} from 'child_process';
import config from '../config';

export function addDevDependency(dependency, pkg) {
  return new Promise((resolve, reject) => {
    exec(`npm view ${dependency}@latest version`, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }
      pkg.devDependencies = pkg.devDependencies || {};
      pkg.devDependencies[dependency] = `^${stdout.trim()}`;
      resolve();
    });
  });
}

export async function addScript(options, name, script, pkg) {
  pkg.scripts = pkg.scripts || {};
  options = options || {};
  if (pkg.scripts[name] && pkg.scripts[name] !== script) {
    if (!options.force) {
      console.error(`addScript: not overwriting script ${script}. Use options.force to continue`);
      throw new Error(`addScript: not overwriting script ${script}. Use options.force to continue`);
    }
    console.warn(`addScript: overwriting existing script ${name}`);
  }
  pkg.scripts[name] = script;
}

export function combineScripts(options, name, script, pkg) {
  let scripts = pkg.scripts[name];
  if (scripts) {
    scripts = scripts
      .replace(`npm run --silent `, ``)
      .replace(`npm run `, ``)
      .split(`&&`);
  }
  else {
    scripts = [];
  }

  scripts.push(script);
  scripts = uniq(scripts);
  for (const s of scripts) {
    if (!pkg.scripts[s]) {
      throw new Error(`package: attempted to add unknown script ${script} to ${name}`);
    }
  }

  pkg.scripts[name] = scripts
    .map((s) => `npm run --silent ${s}`)
    .join(` && `);

  return pkg;
}

export async function load(filename) {
  // eslint-disable-next-line global-require
  return require(filename);
}

export async function save(filename, pkg) {
  return await writeFile(filename, `${JSON.stringify(pkg, null, 2)}\n`);
}

export function format(pkg) {
  let result = Object.assign({}, config.get(`format-package:defaults`), pkg, config.get(`format-package:overrides`));
  result = config.get(`format-package:order`).reduce(sorter, {});

  const unknownKeys = difference(Object.keys(pkg), config.get(`format-package:order`));
  result = unknownKeys.reduce(sorter, result);

  return result;

  function sorter(acc, key) {
    acc[key] = pkg[key];
    return acc;
  }
}
