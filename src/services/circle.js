import inquirer from 'inquirer';
import cache from '../lib/decorators/cache';
import log from '../lib/decorators/log';
import request from '../lib/request';
import Service from '../lib/service';

export default class Circle extends Service {
  @cache({
    secret: true,
    service: `circleci`,
    name: `automation.token`
  })
  @log()
  async getToken() {
    const {token} = await inquirer.prompt([{
      message: `Enter your Circle CI api token`,
      name: `token`,
      type: `password`,
      validate: (value) => !!value.length
    }]);

    return token;
  }

  @log()
  async addEnvironmentVariable({name, value}) {
    await request({
      method: `POST`,
      uri: `https://circleci.com/api/v1.1/project/github/${this.config.get(`github.org`)}/${this.config.get(`github.project`)}/envvar`,
      qs: {'circle-token': await this.getToken()},
      body: {
        name,
        value
      }
    });
  }

  @log()
  async follow() {
    await request({
      method: `POST`,
      uri: `https://circleci.com/api/v1.1/project/github/${this.config.get(`github.org`)}/${this.config.get(`github.project`)}/follow`,
      qs: {'circle-token': await this.getToken()}
    });
  }
}
