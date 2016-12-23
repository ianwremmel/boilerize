import config from '../config';
import init from '../init';

exports.command = `init`;
exports.desc = `Initialize a project with useful things`;
exports.handler = (argv) => {
  config.save();

  // TODO need to wrap handler in somethign that can handle async errors
  return init(argv);
};
