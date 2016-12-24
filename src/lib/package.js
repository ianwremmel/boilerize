import {difference, get, uniq} from 'lodash/fp';
import {writeFile} from 'fs-promise';
import {exec} from 'child_process';
import {install} from './npm';

let needed = false;

export function addDevDependency(dependency, pkg) {
  if (!dependency) {
    throw new Error(`dependency is required`);
  }

  if (pkg.devDependencies[dependency]) {
    return Promise.resolve();
  }
  needed = true;
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

export function format(config) {
  let result = Object.assign({}, get(`format-package.defaults`, config), config.pkg, get(`format-package.overrides`, config));
  result = get(`format-package.order`, config).reduce(sorter, {});

  const unknownKeys = difference(Object.keys(config.pkg), get(`format-package.order`, config)).sort();
  result = unknownKeys.reduce(sorter, result);

  return result;

  function sorter(acc, key) {
    acc[key] = config.pkg[key];
    return acc;
  }
}

export async function installIfNeeded() {
  if (needed) {
    await install();
  }
}
