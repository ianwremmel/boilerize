import {uniq} from 'lodash/fp';
import ConfigFile from '../lib/config-file';

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
}
