/* eslint no-continue: 0 */

import {get, has, template} from 'lodash/fp';
import {writeFile} from 'fs-promise';
import S from 'string';

const handlers = {
  Title(config) {
    if (get(`pkg.title`, config)) {
      return `# ${get(`pkg.title`, config)} _(${get(`pkg.name`, config)})_`;
    }

    return `# ${get(`pkg.name`, config)}`;
  },
  Badges(config) {
    return get(`format-readme.badges`, config).reduce((acc, tpl) => {
      acc += `${template(tpl)(config)}\n`;
      return acc;
    }, `\n`);
  },
  'Short Description'(config) {
    return `> ${get(`pkg.description`, config)}\n`;
  },
  'Long Description'(config) {
    const ld = get(`format-readme.sections['Long Description']`, config);
    if (ld) {
      return `${ld}`;
    }
    return ``;
  },
  'Table of Contents'(config) {
    let start = false;
    return toOrder(config).reduce((acc, key) => {
      if (start) {
        acc += `- [${key}](#${S(key).dasherize().chompLeft(`-`).s})\n`;
      }
      if (key === `Table of Contents`) {
        start = true;
      }
      return acc;
    }, `\n## Table of Contents\n\n`);
  }
};


function toOrder(config) {
  // Add the top set of keys if they are required, have a handler, or have a
  // user defined config.

  let order = get(`format-readme.order.begin`, config).reduce((acc, key) => {
    if (get(`format-readme.required`, config).includes(key) || key in handlers || key in get(`format-readme.sections`, config)) {
      acc.push(key);
    }
    return acc;
  }, []);

  // Add user defined sections that are not end or top sections
  order = Object.keys(get(`format-readme.sections`, config)).reduce((acc, key) => {
    if (!acc.includes(key) && !get(`format-readme.order.end`, config).includes(key)) {
      acc.push(key);
    }
    return acc;
  }, order);

  // Add end sections
  order = get(`format-readme.order.end`, config).reduce((acc, key) => {
    if (key in handlers || key in get(`format-readme.sections`, config)) {
      acc.push(key);
    }
    return acc;
  }, order);

  return order;
}

export async function save(outPath, readme) {
  await writeFile(outPath, readme);
}

export async function format(config) {
  const keys = [
    `github.org`,
    `github.project`,
    `pkg.name`,
    `pkg.description`,
    `pkg.author`,
    `pkg.license`,
    `format-readme.sections.Contribute`,
    `format-readme.sections.Install`,
    `format-readme.sections.License`,
    `format-readme.sections.Usage`
  ];
  for (const key of keys) {
    if (!has(key, config)) {
      throw new Error(`${key} is required`);
    }
  }

  return toOrder(config).reduce((acc, key) => {
    // Need to special-case Long Description and let a handle deal with it.
    if (key !== `Long Description`) {
      const text = get(`format-readme.sections.${key}`, config);
      if (text) {
        return `${acc}\n## ${key}\n\n${template(text)(config)}\n`;
      }
    }

    const fn = handlers[key];
    if (fn) {
      const next = fn(config);
      if (next) {
        return `${acc}${next}\n`;
      }
    }
    else if (get(`format-readme.required`, config).includes(key)) {
      throw new Error(`format-readme. no text provided for section \`${key}\``);
    }
    return acc;
  }, ``);
}
