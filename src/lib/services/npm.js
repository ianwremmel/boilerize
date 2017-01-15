import Service from '../service';
import {spawn} from 'child_process';

export default class NPM extends Service {
  async install() {
    console.info(`init: installing new packages`);

    await new Promise((resolve, reject) => {
      const child = spawn(`npm`, [`install`], {stdio: `inherit`});
      child.on(`close`, (code) => {
        if (code) {
          const error = new Error(`npm install failed with code ${code}`);
          error.code = code;
          reject(error);
          return;
        }
        resolve();
      });
    });

    console.info(`init: done installing new packages`);
  }
}
