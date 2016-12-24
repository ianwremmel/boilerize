import init from '../init';
import handleError from '../lib/handle-error';

const config = require(`../config`);

export const command = `init`;
export const desc = `Initialize a project with useful things`;
export const handler = handleError((argv) => {
  config.save();

  return init(argv);
});
