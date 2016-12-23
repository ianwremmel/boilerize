import {writeFile} from 'fs-promise';
import {exec} from 'child_process';

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

// TODO create combineScripts
export async function addScript(options, name, script, pkg) {
  pkg.scripts = pkg.scripts || {};
  options = options || {};
  if (pkg.scripts[name]) {
    if (!options.force) {
      console.error(`addScript: not overwriting script ${script}. Use options.force to continue`);
      throw new Error(`addScript: not overwriting script ${script}. Use options.force to continue`);
    }
    console.warn(`addScript: overwriting existing script ${name}`);
  }
  pkg.scripts[name] = script;
}

export async function load(filename) {
  // eslint-disable-next-line global-require
  return require(filename);
}

export async function save(filename, pkg) {
  return await writeFile(filename, `${JSON.stringify(pkg, null, 2)}\n`);
}
