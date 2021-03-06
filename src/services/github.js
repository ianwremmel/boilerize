import base32 from 'base32';
import crypto from 'crypto';
import GitHubApi from 'github';
import inquirer from 'inquirer';
import cache from '../lib/decorators/cache';
import log from '../lib/decorators/log';
import Service from '../lib/service';

function randomId() {
  return base32.encode(crypto.randomBytes(4));
}

export default class Github extends Service {
  // Long-term, this should accept scopes, secrets base key, note, note url, etc
  // as parameters
  @cache({secret: true, service: `github`, name: `automation.token`})
  @log()
  async getToken() {
    // Reminder: prompting here because we don't want to store the password in
    // boilerizerc
    const answers = await inquirer.prompt([
      {
        default: this.config.get(`github.org`),
        message: `What GitHub user do you want to use for automation tasks?`,
        name: `username`,
        type: `input`,
        validate: (input) => !!input.length,
        when: () => !this.g.secrets.get(`github`, `automation.username`)
      },
      {
        message: `What is that password for that user?`,
        name: `password`,
        type: `password`,
        validate: (input) => !!input.length,
        when: () => !this.g.secrets.get(`github`, `automation.password`)
      }
    ]);

    answers.password = answers.password || this.g.secrets.get(`github`, `automation.password`);
    answers.username = answers.username || this.g.secrets.get(`github`, `automation.username`);

    if (!answers.password) {
      throw new Error(`password`);
    }

    if (!answers.username) {
      throw new Error(`username`);
    }

    const github = new GitHubApi({Promise});
    github.authenticate({
      type: `basic`,
      username: answers.username,
      password: answers.password
    });

    const {token} = await github.authorization.create({
      scopes: [
        `repo`,
        `read:org`,
        `user:email`,
        `repo_deployment`,
        `repo:status`,
        `write:repo_hook`
      ],
      note: `semantic-release-${this.g.config.package.name}-${randomId()}`,
        // eslint-disable-next-line camelcase
      note_url: `https://github.com/ianwremmel/boilerize`
    });

    if (!token) {
      throw new Error(`Failed to get GitHub token`);
    }

    this.g.secrets.set(`github`, `automation.username`, answers.username);
    this.g.secrets.set(`github`, `automation.passsword`, answers.password);

    return token;
  }

  @log()
  async protectBranch(branch, checks) {
    // Reminder: prompting here because we don't want to store the password in
    // boilerizerc
    const answers = await inquirer.prompt([
      {
        default: this.config.get(`github.org`),
        message: `What is your Github username?`,
        name: `username`,
        type: `input`,
        validate: (input) => !!input.length,
        when: () => !this.g.secrets.get(`github`, `user.username`)
      },
      {
        message: `What is your Github password?`,
        name: `password`,
        type: `password`,
        validate: (input) => !!input.length,
        when: () => !this.g.secrets.get(`github`, `user.password`)
      }
    ]);

    answers.password = answers.password || this.g.secrets.get(`github`, `user.password`);
    answers.username = answers.username || this.g.secrets.get(`github`, `user.username`);

    if (!answers.password) {
      throw new Error(`password`);
    }

    if (!answers.username) {
      throw new Error(`username`);
    }

    const github = new GitHubApi({Promise});
    github.authenticate({
      type: `basic`,
      username: answers.username,
      password: answers.password
    });

    await github.repos.updateBranchProtection({
      owner: this.config.get(`github.org`),
      repo: this.config.get(`github.project`),
      branch,
      // eslint-disable-next-line camelcase
      required_status_checks: {
        // eslint-disable-next-line camelcase
        include_admins: true,
        strict: true,
        contexts: checks
      },
      // eslint-disable-next-line camelcase
      required_pull_request_reviews: null,
      restrictions: null
    });

    this.g.secrets.set(`github`, `user.username`, answers.username);
    this.g.secrets.set(`github`, `user.passsword`, answers.password);
  }
}
