import handleError from '../../lib/handle-error';

const config = require(`../../config`);

export const command = `get [key]`;
export const desc = `prints the config at \`key\`. If \`key\` is not set, prints all config`;
export const handler = handleError((argv) => {
  console.log(config.get(argv.key));
});
