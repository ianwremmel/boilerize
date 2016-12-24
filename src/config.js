import nconf from 'nconf';
import os from 'os';
import path from 'path';
import requireDir from 'require-dir';

nconf.file(`local`, path.join(process.cwd(), `.boilerizerc`));
nconf.add(`defaults`, {
  type: `literal`,
  store: requireDir(`../config`)
});
nconf.file(`global`, path.join(os.homedir(), `.boilerizerc`));

module.exports = nconf;
