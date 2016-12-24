const config = require(`../../config`);
import handleError from '../../lib/handle-error';

exports.command = `delete <key>`;
exports.desc = `Deletes a config key`;
exports.handler = handleError((argv) => config.set(argv.key, null));
