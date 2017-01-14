import Config from './lib/config';
import Circle from './lib/config-files/circle';
import EditorConfig from './lib/config-files/editorconfig';
import ESLint from './lib/config-files/eslint';
import Package from './lib/config-files/package';
import Readme from './lib/config-files/readme';

import inquirer from 'inquirer';

import rc from 'rc';
import requireDir from 'require-dir';

export default async function init() {
  const config = new Config(rc(`boilerize`, Object.assign({}, requireDir(`../config`))));

  const pkg = new Package(config);
  const circle = new Circle(config, {package: pkg});
  const editorconfig = new EditorConfig(config, {package: pkg});
  const eslint = new ESLint(config, {package: pkg});
  const readme = new Readme(config, {package: pkg});

  await Promise.all([
    circle.load(),
    editorconfig.load(),
    eslint.load(),
    pkg.load(),
    readme.load()
  ]);

  const prompt = circle.prompt()
    .concat(editorconfig.prompt())
    .concat(eslint.prompt())
    .concat(pkg.prompt())
    .concat(readme.prompt());

  const answers = await inquirer.prompt(prompt);
  config.merge(answers);

  await config.save();

  await pkg.setup();
  await circle.setup();
  await editorconfig.setup();
  await eslint.setup();
  await readme.setup();

  await Promise.all([
    circle.save(),
    editorconfig.save(),
    eslint.save(),
    pkg.save(),
    readme.save()
  ]);

  await pkg.installIfNeeded();
}
