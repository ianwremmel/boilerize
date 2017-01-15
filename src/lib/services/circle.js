import Service from '../service';
import request from '../request';

export default class Circle extends Service {
  async addEnvironmentVariable({name, value}) {
    await request({
      method: `POST`,
      uri: `https://circleci.com/api/v1.1/project/github/${this.config.get(`github.org`)}/${this.config.get(`github.project`)}/envvar`,
      qs: {
        'circle-token': this.config.get(`circle.token`)
      },
      body: {
        name,
        value
      }
    });
  }

  async follow() {
    await request({
      method: `POST`,
      uri: `https://circleci.com/api/v1.1/project/github/${this.config.get(`github.org`)}/${this.config.get(`github.project`)}/follow`,
      qs: {
        'circle-token': this.config.get(`circle.token`)
      }
    });
  }
}
