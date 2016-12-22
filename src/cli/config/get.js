const config = require(`../../config`);

exports.command = `get [key]`;
exports.desc = `prints the config at \`key\`. If \`key\` is not set, prints all config`;
exports.handler = (argv) => {
  console.log(config.get(argv.key));
};
