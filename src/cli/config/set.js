const config = require(`../../config`);
import handleError from '../../lib/handle-error';

exports.command = `set <key> <value>`;
exports.desc = `Sets a config key`;
exports.handler = handleError((argv) => {
  config.set(argv.key, argv.value);
  return config.save();
});
