import formatReadme from '../format-readme';
import path from 'path';
import handleError from '../lib/handle-error';

export const command = `format-readme`;
export const desc = `Apply standard rules to README.md`;
export const handler = handleError((argv) => formatReadme(path.join(argv.dir, `README.md`), require(path.join(argv.dir, `package.json`))));
