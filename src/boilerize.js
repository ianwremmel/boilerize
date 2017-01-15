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

  const secrets = new Secrets();
  const g = {
    services: {}
  };

  g.services.circle = new CircleService(config, g);
  g.services.github = new GithubService(config, g);
  g.services.npm = new NpmService(config, g);
  g.config.package = new Package(config, g);
  g.config.circle = new CircleConfig(config, g);
  g.config.editorconfig = new EditorConfig(config, g);
  g.config.eslint = new ESLintConfig(config, g);
  g.config.readme = new ReadmeConfig(config, g);

  await Promise.all([
    circle.load(),
    editorconfig.load(),
    eslint.load(),
    pkg.load(),
    readme.load()
  ]);

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
