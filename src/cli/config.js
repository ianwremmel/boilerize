const config = require(`../config`);
const y = require(`yargs`);

exports.command = `config [command]`;
exports.desc = `Interact with local and global config files`;
exports.builder = (yargs) => yargs
  .option(`global`, {
    alias: `g`,
    default: false,
    type: `boolean`
  })
  .commandDir(`./config`);
exports.handler = (argv) => {
  if (argv.global) {
    config.remove(`local`);
  }

  if (!argv.command) {
    y.showHelp();
  }
};
