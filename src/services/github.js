import base32 from 'base32';
import crypto from 'crypto';
import inquirer from 'inquirer';
import npm from 'npm';
import request from '../request';
import Service from '../lib/service';

function randomId() {
  return base32.encode(crypto.randomBytes(4));
}

export default class Github extends Service {
  // TODO use github module
  async getToken() {
    const answers = await inquirer.prompt([{
      message: `What is your GitHub password?`,
      name: `password`,
      type: `password`,
      validate(input) {
        return !!input.length;
      },
      when: (a) => !this.secrets.get(`github`, a.username)
    }]);

    answers.password = answers.password || this.secrets.get(`github`, answers.username);

    const response = await request({
      method: `POST`,
      url: `https://api.github.com/authorizations`,
      json: true,
      auth: {
        user: this.config.get(`github.username`),
        pass: answers.password
      },
      headers: {
        'User-Agent': `semantic-release`
      },
      body: {
        scopes: [
          `repo`,
          `read:org`,
          `user:email`,
          `repo_deployment`,
          `repo:status`,
          `write:repo_hook`
        ],
        note: `semantic-release-${this.package.name}-${randomId()}`
      }
    });

    if (response.statusCode === 201) {
      this.token = response.body.token;
      return this.token;
    }

    console.warn(response.body);
    throw new Error(`Unexpected response from github api ${response.statusCode}`);
  }

  prompt() {
    return [{
      default: true,
      message: `Is this project on GitHub?`,
      name: `github.use`,
      type: `confirm`,
      when: () => !this.config.has(`github.use`)
    },
    {
      default: npm.config.get(`username`),
      message: `What is your GitHub username?`,
      name: `github.org`,
      type: `input`,
      validate(input) {
        return !!input.length;
      },
      when: (answers) => {
        this.config.merge(answers);
        return this.config.use(`github`) && !this.config.has(`github.username`);
      }
    }
    ];
  }
}
