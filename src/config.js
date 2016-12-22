const nconf = require(`nconf`);
const os = require(`os`);
const path = require(`path`);
const requireDir = require(`require-dir`);

nconf.file(`local`, path.join(process.cwd(), `.boilerizerc`));
nconf.add(`defaults`, {
  type: `literal`,
  store: requireDir(`../config`)
});
nconf.file(`global`, path.join(os.homedir(), `.boilerizerc`));

module.exports = nconf;
