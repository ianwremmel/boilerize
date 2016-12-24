import {
  load as loader,
  save as saver,
  exists
} from './fs';

import {get} from 'lodash';

const FILENAME = `.editorconfig`;

export const load = loader(FILENAME);
export const save = saver(FILENAME);

export default async function setupEditorConfig(options, config) {
  if (!await exists(FILENAME)) {
    await save(get(`project.editor-config`, config));
  }
}
