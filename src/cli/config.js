import config from '../config';
import handleError from '../lib/handle-error';
import y from 'yargs';

exports.command = `config [command]`;
exports.desc = `Interact with local and global config files`;
exports.builder = (yargs) => yargs
  .option(`global`, {
    alias: `g`,
    default: false,
    type: `boolean`
  })
  .commandDir(`./config`);
exports.handler = handleError((argv) => {
  if (argv.global) {
    config.remove(`local`);
  }

  if (!argv.command) {
    y.showHelp();
  }
});
