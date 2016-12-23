/* eslint no-continue: 0 */

const _ = require(`lodash/fp`);
const config = require(`./config`);
const fs = require(`fs`);
const S = require(`string`);

const handlers = {
  Title() {
    if (config.get(`pkg:title`)) {
      return `# ${config.get(`pkg:title`)} _(${config.get(`pkg:name`)})_`;
    }

    return `# ${config.get(`pkg:name`)}`;
  },
  Badges(cfg) {
    return config.get(`format-readme:badges`).reduce((acc, tpl) => {
      acc += `${_.template(tpl)(cfg)}\n`;
      return acc;
    }, `\n`);
  },
  'Short Description'() {
    return `> ${config.get(`pkg:description`)}\n`;
  },
  'Long Description'() {
    const ld = config.get(`format-readme:sections:Long Description`);
    if (ld) {
      return `${ld}`;
    }
    return ``;
  },
  'Table of Contents'() {
    return toOrder().reduce((acc, key) => {
      acc += `- [${key}](#${S(key).dasherize().chompLeft(`-`).s})\n`;
      return acc;
    }, `\n## Table of Contents\n`);
  }
};


function toOrder() {
  // Add the top set of keys if they are required, have a handler, or have a
  // user defined config.

  let order = config.get(`format-readme:order:begin`).reduce((acc, key) => {
    if (config.get(`format-readme:required`).includes(key) || key in handlers || key in config.get(`format-readme:sections`)) {
      acc.push(key);
    }
    return acc;
  }, []);

  // Add user defined sections that are not end or top sections
  order = Object.keys(config.get(`format-readme:sections`)).reduce((acc, key) => {
    if (!acc.includes(key) && !config.get(`format-readme:order:end`).includes(key)) {
      acc.push(key);
    }
    return acc;
  }, order);

  // Add end sections
  order = config.get(`format-readme:order:end`).reduce((acc, key) => {
    if (key in handlers || key in config.get(`format-readme:sections`)) {
      acc.push(key);
    }
    return acc;
  }, order);

  return order;
}

module.exports = function formatReadme(readmePath, pkg) {
  config.add(`pkg`, {type: `literal`, store: {pkg}});
  config.required([
    `github:org`,
    `github:project`,
    `pkg:name`,
    `pkg:description`,
    `pkg:author`,
    `pkg:license`,
    `format-readme:sections:Contribute`,
    `format-readme:sections:Install`,
    `format-readme:sections:License`,
    `format-readme:sections:Usage`
  ]);

  const cfg = config.get();

  const out = toOrder().reduce((acc, key) => {
    // Need to special-case Long Description and let a handle deal with it.
    if (key !== `Long Description`) {
      const text = config.get(`format-readme:sections:${key}`);
      if (text) {
        return `${acc}\n## ${key}\n\n${_.template(text)(cfg)}\n`;
      }
    }

    const fn = handlers[key];
    if (fn) {
      const next = fn(cfg);
      if (next) {
        return `${acc}${next}\n`;
      }
    }
    else if (config.get(`format-readme:required`).includes(key)) {
      throw new Error(`format-readme: no text provided for section \`${key}\``);
    }
    return acc;
  }, ``);

  fs.writeFileSync(readmePath, out);
};
