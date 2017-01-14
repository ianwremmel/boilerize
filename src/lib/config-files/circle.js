import {uniq} from 'lodash/fp';
import request from 'request-promise-native';
import ConfigFile from '../config-file';
import {override} from 'core-decorators';

export default class Circle extends ConfigFile {
  static FILENAME = `circle.yml`;

  async addDeployment({name, branch, script}) {
    const deployments = this.data.deployments;
    deployments[name] = deployments[name] || {
      branch,
      commands: []
    };

    let commands = deployments[name].commands;
    commands.push(script);
    commands = uniq(commands);

    this.data.deployments = deployments;
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

  @override
  prompt() {
    return [
      {
        message: `Circle CI Token`,
        name: `circle.token`,
        type: `password`,
        when: (answers) => {
          this.config.merge(answers);
          return !this.config.has(`circle.token`);
        }
      },
      {
        message: `GitHub Org or Username`,
        name: `github.org`,
        type: `input`,
        when: (answers) => {
          this.config.merge(answers);
          return !this.config.has(`github.org`);
        }
      },
      {
        message: `GitHub Project`,
        name: `github.project`,
        type: `input`,
        when: (answers) => {
          this.config.merge(answers);
          return !this.config.has(`github.project`);
        }
      }
    ];
  }
}
