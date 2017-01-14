import {exec} from 'child_process';
import {difference, isString, uniq} from 'lodash/fp';
import ConfigFile from '../config-file';
import {install} from '../npm';
import {override} from 'core-decorators';
import {save} from '../fs';

export default class Package extends ConfigFile {
  static FILENAME = `package.json`;

  addDevDependency(dependency) {
    if (!dependency) {
      throw new Error(`dependency is required`);
    }

    if (this.data.devDependencies[dependency]) {
      return Promise.resolve();
    }
    this.installNeeded = true;
    return new Promise((resolve, reject) => {
      exec(`npm view ${dependency}@latest version`, (err, stdout) => {
        if (err) {
          reject(err);
          return;
        }
        this.data.devDependencies = this.data.devDependencies || {};
        this.data.devDependencies[dependency] = `^${stdout.trim()}`;
        resolve();
      });
    });
  }

  addScript(options, name, script) {
    this.data.scripts = this.data.scripts || {};
    if (isString(options)) {
      script = name;
      name = options;
      options = undefined;
    }
    options = options || {};

    if (this.data.scripts[name] && this.data.scripts[name] !== script) {
      if (!options.force) {
        console.error(`addScript: not overwriting script ${script}. Use options.force to continue`);
        throw new Error(`addScript: not overwriting script ${script}. Use options.force to continue`);
      }
      console.warn(`addScript: overwriting existing script ${name}`);
    }
    this.data.scripts[name] = script;
  }

  combineScripts(name, script) {
    let currentScript = this.data.scripts[name];
    if (currentScript) {
      currentScript = currentScript
        .replace(`npm run --silent `, ``)
        .replace(`npm run `, ``)
        .split(`&&`)
        .map((str) => str.trim());
    }
    else {
      currentScript = [];
    }

    currentScript.push(script);
    currentScript = uniq(currentScript);

    for (const s of currentScript) {
      if (!this.data.scripts[s]) {
        throw new Error(`package: attempted to add unknown script ${s} to ${name}`);
      }
    }

    this.data.scripts[name] = currentScript
      .map((s) => `npm run --silent ${s}`)
      .join(` && `);

  }

  async installIfNeeded() {
    if (this.installNeeded) {
      await install();
    }
  }

  async save() {
    const d = this.toJSON();
    if (d && Object.keys(d).length) {
      await save(this.constructor.FILENAME, d);
    }
  }

  @override
  async setup() {
    this.data[`pre-commit`] = `lint:staged`;

    await this.addScript(`lint:staged`, `lint-staged`, this.data);
    this.data[`lint-staged`] = {};
  }

  setVersion(version) {
    this.data.version = version;
  }

  @override
  toJSON() {
    const fpDefaults = this.config.get(`format-package.defaults`);
    const fpOverrides = this.config.get(`format-package.overrides`);
    const fpOrder = this.config.get(`format-package.order`);

    const unsorted = Object.assign({}, fpDefaults, this.data, fpOverrides);
    const unknownKeys = difference(Object.keys(unsorted), fpOrder).sort();

    return unknownKeys.reduce(sorter, fpOrder.reduce(sorter, {}));

    function sorter(acc, key) {
      acc[key] = unsorted[key];
      return acc;
    }
  }
}
