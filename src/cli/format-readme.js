const formatReadme = require(`../format-readme`);
const path = require(`path`);

exports.command = `format-readme`;
exports.desc = `Apply standard rules to README.md`;
exports.handler = (argv) => {
  formatReadme(path.join(argv.dir, `README.md`), require(path.join(argv.dir, `package.json`)));
};
