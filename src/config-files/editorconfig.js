import {override} from 'core-decorators';
import {readFile, writeFile} from 'fs-promise';
import ConfigFile from '../lib/config-file';
import log from '../lib/decorators/log';

export default class EditorConfig extends ConfigFile {
  static FILENAME = `.editorconfig`;

  @override
  @log()
  async load() {
    try {
      this.data = await readFile(this.constructor.FILENAME);
    }
    catch (err) {
      if (err.code !== `ENOENT`) {
        throw err;
      }
      this.data = {};
    }
  }

  @override
  @log()
  save() {
    // Reminder: need to do this in two lines so that save doesn't delete the
    // file's contents before a subsequent failure.
    const out = this.config.get(`editor-config.raw`);

    return writeFile(this.constructor.FILENAME, out);
  }
}
