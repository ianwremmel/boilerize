import config from '../config';
import init from '../init';
import handleError from '../lib/handle-error';

exports.command = `init`;
exports.desc = `Initialize a project with useful things`;
exports.handler = handleError((argv) => {
  config.save();

  return init(argv);
});
