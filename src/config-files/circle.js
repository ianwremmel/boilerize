import {override} from 'core-decorators';
import {uniq} from 'lodash/fp';
import ConfigFile from '../lib/config-file';
import log from '../lib/decorators/log';
import {sort} from '../lib/format-json';
import {save} from '../lib/fs';

export default class Circle extends ConfigFile {
  static FILENAME = `circle.yml`;

  @log()
  async addDeployment({name, branch, script}) {
    const deployment = this.data.deployment || {};
    deployment[name] = deployment[name] || {
      branch,
      commands: []
    };

    const commands = deployment[name].commands;
    commands.push(script);
    deployment[name].commands = uniq(commands);

    this.data.deployment = deployment;
  }

  @log()
  async addScript(phase, hook, script) {
    if (!script) {
      script = hook;
      hook = `override`;
    }

    this.data[phase] = this.data[phase] || {};
    const data = this.data[phase][hook] || [];
    data.push(script);
    this.data[phase][hook] = uniq(data);
  }

  @override
  @log()
  async save() {
    const d = this.toJSON();
    if (d && Object.keys(d).length) {
      await save(this.constructor.FILENAME, d);
    }
  }

  @log()
  setNodeVersion(version) {
    version = version
      .replace(/>/g, ``)
      .replace(/\=/g, ``)
      .replace(/\=/g, ``)
      .replace(/\.x/g, ``);
    this.g.config.circle.set(`machine.node.version`, version);
  }

  @override
  @log()
  toJSON() {
    const cOrder = this.config.get(`circle.order`);
    const unsorted = this.data;
    return sort(cOrder, unsorted);
  }
}
