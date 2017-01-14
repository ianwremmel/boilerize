import {readFile, writeFile} from 'fs-promise';
import ConfigFile from '../config-file';
import {override} from 'core-decorators';

export default class EditorConfig extends ConfigFile {
  static FILENAME = `.editorconfig`;

  @override
  async load() {
    this.data = await readFile(this.constructor.FILENAME);
  }

  @override
  async save() {
    // Reminder: need to do this in two lines so that save doesn't delete the
    // file's contents before a subsequent failure.
    const out = this.config.get(`editor-config.raw`);
    return writeFile(this.constructor.FILENAME, out);
  }
}
