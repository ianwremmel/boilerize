import {
  exists as fsExists,
  readFile,
  writeFile
} from 'fs-promise';
import jsyaml from 'js-yaml';
import {curry} from 'lodash/fp';
import {resolve} from 'path';

export function exists(filename) {
  return async function curriedExists() {
    const filePath = resolve(process.cwd(), filename);
    return await fsExists(filePath);
  };
}

// Can't use curry here because it'll invoke immediately
export function load(filename) {
  return async function curriedLoad() {
    const filePath = resolve(process.cwd(), filename);
    try {
      const raw = await readFile(filePath, `utf8`);
      try {
        return JSON.parse(raw);
      }
      catch (err) {
        try {
          return jsyaml.safeLoad(raw);
        }
        catch (err2) {
          console.warn(`Failed to parse ${filePath} as JSON or YAML. Did you mean to use fs.readFile?`);
          return raw;
        }
      }
    }
    catch (err) {
      return {};
    }
  };
}

export const save = curry(async (filename, data) => {
  const filePath = resolve(process.cwd(), filename);
  switch (filePath.split(`.`).pop()) {
  case `json`:
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
    break;
  case `md`:
    await writeFile(filePath, data);
    break;
  case `yaml`:
  case `yml`:
    await writeFile(filePath, jsyaml.safeDump(data));
    break;
  default:
    console.warn(`Could not determine output type for ${filePath}. Did you mean to use fs.writeFile?`);
    await writeFile(filePath, data);
  }
});
