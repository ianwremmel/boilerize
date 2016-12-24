import {spawn} from 'child_process';

export async function install() {
  console.log(`init: installing new packages`);

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

  console.log(`init: done installing new packages`);
}
