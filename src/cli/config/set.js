const config = require(`../../config`);

exports.command = `set <key> <value>`;
exports.desc = `Sets a config key`;
exports.handler = (argv) => {
  config.set(argv.key, argv.value);
  config.save();
};
