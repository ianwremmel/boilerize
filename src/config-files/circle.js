import {uniq} from 'lodash/fp';
import ConfigFile from '../lib/config-file';
import log from '../lib/decorators/log';

export default class Circle extends ConfigFile {
  static FILENAME = `circle.yml`;

  @log()
  async addDeployment({name, branch, script}) {
    const deployments = this.data.deployments || {};
    deployments[name] = deployments[name] || {
      branch,
      commands: []
    };

    const commands = deployments[name].commands;
    commands.push(script);
    deployments[name].commands = uniq(commands);

    this.data.deployments = deployments;
  }

  @log()
  setNodeVersion(version) {
    version = version
      .replace(/>/g, ``)
      .replace(/\=/g, ``)
      .replace(/\=/g, ``);
    this.g.config.circle.set(`machine.node.version`, version);
  }
}
