const config = require(`../../config`);
import handleError from '../../lib/handle-error';

exports.command = `get [key]`;
exports.desc = `prints the config at \`key\`. If \`key\` is not set, prints all config`;
exports.handler = handleError((argv) => {
  console.log(config.get(argv.key));
});
