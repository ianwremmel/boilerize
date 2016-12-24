import handleError from '../lib/handle-error';
import y from 'yargs';

const config = require(`../config`);

export const command = `config [command]`;
export const desc = `Interact with local and global config files`;
export function builder(yargs) {
  return yargs
    .option(`global`, {
      alias: `g`,
      default: false,
      type: `boolean`
    })
    .commandDir(`./config`);
}
export const handler = handleError((argv) => {
  if (argv.global) {
    config.remove(`local`);
  }

  if (!argv.command) {
    y.showHelp();
  }
});
