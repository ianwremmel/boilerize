const nconf = require(`nconf`);
const os = require(`os`);
const path = require(`path`);

nconf.file(`local`, path.join(process.cwd(), `.boilerizerc`));
nconf.file(`global`, path.join(os.homedir(), `.boilerizerc`));

module.exports = nconf;
