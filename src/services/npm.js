import {spawn} from 'child_process';
import inquirer from 'inquirer';
import npm from 'npm';
import RegistryClient from 'npm-registry-client';
import url from 'url';
import cache from '../lib/decorators/cache';
import log from '../lib/decorators/log';
import Service from '../lib/service';

export default class NPM extends Service {
  @cache({secret: true, service: `npm`, name: `automation.token`})
  @log()
  async getToken() {
    const answers = await inquirer.prompt([{
      type: `input`,
      name: `registry`,
      message: `What is your npm registry?`,
      default: npm.config.get(`registry`)
    }, {
      type: `input`,
      name: `username`,
      message: `What npm user do you want to use for automation tasks?`,
      default: npm.config.get(`username`),
      validate: (input) => !!input.length,
      when: () => !this.g.secrets.get(`npm`, `automation.username`)
    }, {
      type: `password`,
      name: `password`,
      message: `What is that password for that user?`,
      validate: (input) => !!input.length,
      when: () => !this.g.secrets.get(`npm`, `automation.password`)
    }]);

    this.config.merge({'npm.registry': answers.registry});

    answers.password = answers.password || this.g.secrets.get(`npm`, `automation.password`);
    answers.username = answers.username || this.g.secrets.get(`npm`, `automation.username`);

    if (!answers.password) {
      throw new Error(`password`);
    }

    if (!answers.username) {
      throw new Error(`username`);
    }

    const token = await new Promise((resolve, reject) => {
      const client = new RegistryClient();
      const uri = url.resolve(answers.registry, `-/user/org.couchdb.user:${encodeURIComponent(this.g.secrets.get(`npm`, `username`))}`);
      const body = {
        _id: `org.couchdb.user:${answers.username}`,
        name: answers.username,
        password: answers.password,
        type: `user`,
        roles: [],
        date: new Date().toISOString()
      };

      client.request(uri, {
        method: `PUT`,
        body
      }, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(data.token);
      });
    });

    if (!token) {
      throw new Error(`Failed to get npm token`);
    }

    this.g.secrets.set(`npm`, `automation.username`, answers.username);
    this.g.secrets.set(`npm`, `automation.passsword`, answers.password);

    return token;
  }

  @log()
  async install() {
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
  }
}
