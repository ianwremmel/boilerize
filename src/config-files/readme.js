import {override} from 'core-decorators';
import {readFile} from 'fs-promise';
import {template} from 'lodash/fp';
import S from 'string';
import ConfigFile from '../lib/config-file';
import log from '../lib/decorators/log';

export default class Readme extends ConfigFile {
  static FILENAME = `README.md`;

  @log()
  Title() {
    if (this.g.config.package.has(`title`)) {
      return `# ${this.g.config.package.get(`title`)} _(${this.g.config.package.get(`name`)})_`;
    }

    return `# ${this.g.config.package.get(`name`)}`;
  }

  @log()
  Badges() {
    return this.config.get(`format-readme.badges`).reduce((acc, tpl) => {
      acc += `${template(tpl)(Object.assign({pkg: this.g.config.package.clone()}, this.config.clone()))}\n`;

      return acc;
    }, `\n`);
  }

  @log()
  // eslint-disable-next-line quotes
  'Short Description'() {
    return `> ${this.g.config.package.get(`description`)}\n`;
  }

  @log()
  // eslint-disable-next-line quotes
  'Long Description'() {
    const ld = this.config.get(`format-readme.sections['Long Description']`);
    if (ld) {
      return `${ld}`;
    }

    return ``;
  }

  @log()
  // eslint-disable-next-line quotes
  'Table of Contents'() {
    let start = false;

    return Reflect.apply(toOrder, this, [this.config]).reduce((acc, key) => {
      if (start) {
        acc += `- [${key}](#${S(key)
          .dasherize()
          .chompLeft(`-`)
          .s})\n`;
      }
      if (key === `Table of Contents`) {
        start = true;
      }

      return acc;
    }, `\n## Table of Contents\n\n`);
  }

  @log()
  async format() {
    const keys = [
      `github.org`,
      `github.project`,
      `format-readme.sections.Contribute`,
      `format-readme.sections.Install`,
      `format-readme.sections.License`,
      `format-readme.sections.Usage`
    ];

    for (const key of keys) {
      if (!this.config.has(key)) {
        throw new Error(`${key} is required`);
      }
    }

    return Reflect.apply(toOrder, this, [this.config]).reduce((acc, key) => {
      // Need to special-case Long Description and let a handle deal with it.
      if (key !== `Long Description`) {
        const text = this.config.get(`format-readme.sections.${key}`);
        if (text) {
          return `${acc}\n## ${key}\n\n${template(text)(Object.assign({pkg: this.g.config.package.clone()}, this.config.clone()))}\n`;
        }
      }

      const fn = this[key];
      if (fn) {
        const next = Reflect.apply(fn, this, []);
        if (next) {
          return `${acc}${next}\n`;
        }
      }
      else if (this.config.get(`format-readme.required`).includes(key)) {
        throw new Error(`format-readme. no text provided for section \`${key}\``);
      }

      return acc;
    }, ``);
  }

  @override
  @log()
  async load() {
    this.data = await readFile(this.constructor.FILENAME);
  }

  @override
  @log()
  async setup() {
    this.data = await this.format(this.data);
  }
}

function toOrder(config) {
  // Add the top set of keys if they are required, have a handler, or have a
  // user defined config.

  let order = config.get(`format-readme.order.begin`).reduce((acc, key) => {
    // eslint-disable-next-line no-invalid-this
    if (config.get(`format-readme.required`).includes(key) || key in this || key in config.get(`format-readme.sections`)) {
      acc.push(key);
    }

    return acc;
  }, []);

  // Add user defined sections that are not end or top sections
  order = Object.keys(config.get(`format-readme.sections`)).reduce((acc, key) => {
    if (!acc.includes(key) && !config.get(`format-readme.order.end`).includes(key)) {
      acc.push(key);
    }

    return acc;
  }, order);

  // Add end sections
  order = config.get(`format-readme.order.end`).reduce((acc, key) => {
    // eslint-disable-next-line no-invalid-this
    if (key in this || key in config.get(`format-readme.sections`)) {
      acc.push(key);
    }

    return acc;
  }, order);

  return order;
}
