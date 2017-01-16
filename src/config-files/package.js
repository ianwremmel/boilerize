import {exec, spawn} from 'child_process';
import {override} from 'core-decorators';
import {isString, uniq} from 'lodash/fp';
import ConfigFile from '../lib/config-file';
import log from '../lib/decorators/log';
import {save} from '../lib/fs';
import {sort} from '../lib/format-json';

export default class Package extends ConfigFile {
  static FILENAME = `package.json`;

  @log()
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

  @log()
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

  @log()
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

  @log()
  async installIfNeeded() {
    if (this.installNeeded) {
      await this.g.services.npm.install();
    }

    if (this.config.get(`project.js`)) {
      await new Promise((resolve, reject) => {
        const child = spawn(`bash`, [
          `-c`,
          `export PKG=@ianwremmel/eslint-config; npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"`
        ], {stdio: `inherit`});
        child.on(`close`, (code) => {
          if (code) {
            const error = new Error(`Failed to install eslint-config peer dependencies ${code}`);
            error.code = code;
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  }

  @log()
  async save() {
    const d = this.toJSON();
    if (d && Object.keys(d).length) {
      await save(this.constructor.FILENAME, d);
    }
  }

  @override
  @log()
  async setup() {
    this.addScript(`test`, `echo "Please specify a test script"`);
    this.addScript(`posttest`, `npm run lint`);
    this.data[`pre-commit`] = `lint:staged`;

    await this.addScript(`lint:staged`, `lint-staged`, this.data);
    this.data[`lint-staged`] = {};
  }

  setVersion(version) {
    this.data.version = version;
  }

  @override
  @log()
  toJSON() {
    const fpDefaults = this.config.get(`format-package.defaults`);
    const fpOverrides = this.config.get(`format-package.overrides`);
    const fpOrder = this.config.get(`format-package.order`);

    const unsorted = Object.assign({}, fpDefaults, this.data, fpOverrides);
    return sort(fpOrder, unsorted);
  }
}
