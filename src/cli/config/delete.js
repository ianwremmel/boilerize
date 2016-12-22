const config = require(`../../config`);

exports.command = `delete <key>`;
exports.desc = `Deletes a config key`;
exports.handler = (argv) => {
  config.set(argv.key, null);
};
