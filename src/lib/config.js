import {writeFile} from 'fs-promise';
import {get, has, merge, set} from 'lodash/fp';
import flatten from 'flat';
import fs from 'fs';
import path from 'path';

const data = new WeakMap();
const initial = new WeakMap();

export default class Config {
  constructor(d) {
    data.set(this, d);
    initial.set(this, Object.assign({}, d));
  }

  clone() {
    return Object.assign({}, data.get(this));
  }

  get(keypath) {
    return get(keypath, data.get(this));
  }

  has(keypath) {
    return has(keypath, data.get(this));
  }

  inspect() {
    return data.get(this);
  }

  merge(extra) {
    data.set(this, merge(data.get(this), extra));
  }

  set(keypath, value) {
    return set(keypath, data.get(this), value);
  }

  async save() {
    const out = this.toString();
    return await writeFile(`.boilerizerc`, out);
  }

  toJSON() {
    const keys = Object.keys(flatten(data.get(this), {safe: true}));
    const init = initial.get(this);
    let target;
    try {
      const filepath = path.join(process.cwd(), `.boilerizerc`);
      // Using sync here because toJSON can't have async functions in it
      // eslint-disable-next-line no-sync
      const raw = fs.readFileSync(filepath, `utf8`);
      target = JSON.parse(raw);
    }
    catch (e) {
      if (e.code !== `ENOENT`) {
        console.error(e);
        throw e;
      }
      target = {};
    }

    return keys.reduce((acc, key) => {
      if (!has(key, init) || has(key, target)) {
        const val = this.get(key);
        acc = set(key, val, acc);
      }
      return acc;
    }, target);
  }

  toString() {
    return JSON.stringify(this, null, 2);
  }
}
