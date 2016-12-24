import handleError from '../../lib/handle-error';

const config = require(`../../config`);

export const command = `set <key> <value>`;
export const desc = `Sets a config key`;
export const handler = handleError((argv) => {
  config.set(argv.key, argv.value);
  return config.save();
});
