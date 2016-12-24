import handleError from '../../lib/handle-error';

const config = require(`../../config`);

export const command = `delete <key>`;
export const desc = `Deletes a config key`;
export const handler = handleError((argv) => config.set(argv.key, null));
