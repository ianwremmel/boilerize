const formatReadme = require(`../format-readme`);
const path = require(`path`);
import handleError from '../lib/handle-error';

exports.command = `format-readme`;
exports.desc = `Apply standard rules to README.md`;
exports.handler = handleError((argv) => formatReadme(path.join(argv.dir, `README.md`), require(path.join(argv.dir, `package.json`))));
