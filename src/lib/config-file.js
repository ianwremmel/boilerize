import {get, has, set} from 'lodash/fp';
import {load, save} from './fs';

export default class ConfigFile {
  clone() {
    return Object.assign({}, this.data);
  }

  constructor(config, dependencies) {
    if (!this.constructor.FILENAME) {
      throw new Error(`${this.constructor}.FILENAME is required`);
    }

    this.config = config;
    if (dependencies) {
      Object.keys(dependencies).forEach((key) => {
        this[key] = dependencies[key];
      });
    }
  }

  get(key) {
    return get(key, this.data);
  }

  has(key) {
    return has(key, this.data);
  }

  async load() {
    this.data = await load(this.constructor.FILENAME)();
  }

  prompt() {
    return [];
  }

  set(key, value) {
    this.data = set(key, value, this.data);
  }

  async setup() {
    return null;
  }

  async save() {
    if (this.data && Object.keys(this.data).length) {
      await save(this.constructor.FILENAME, this.data);
    }
  }

  toJSON() {
    return this;
  }
}
