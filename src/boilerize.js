import npm from 'npm';
import rc from 'rc';
import requireDir from 'require-dir';
import CircleConfig from './config-files/circle';
import EditorConfig from './config-files/editorconfig';
import ESLintConfig from './config-files/eslint';
import PackageConfig from './config-files/package';
import ReadmeConfig from './config-files/readme';
import Config from './lib/config';
import Secrets from './lib/secrets';
import Basic from './interactive/basic';
import Deployment from './interactive/deployment';
import CircleService from './services/circle';
import GithubService from './services/github';
import NpmService from './services/npm';


export default async function init() {
  await new Promise((resolve, reject) => {
    npm.load((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
  const config = new Config(rc(`boilerize`, Object.assign({}, requireDir(`../config`))));
  const secrets = new Secrets();
  const g = {
    secrets,
    config: {},
    services: {}
  };

  g.config.package = new PackageConfig(config, g);
  g.config.circle = new CircleConfig(config, g);
  g.config.editorconfig = new EditorConfig(config, g);
  g.config.readme = new ReadmeConfig(config, g);

  await Promise.all([
    g.config.circle.load(),
    g.config.editorconfig.load(),
    g.config.package.load(),
    g.config.readme.load()
  ]);

  const basic = new Basic(config, g);
  await basic.prompt();

  g.services.npm = new NpmService(config, g);

  if (config.get(`project.github`)) {
    g.services.github = new GithubService(config, g);
  }

  const deployment = new Deployment(config, g);
  await deployment.prompt();

  if (config.get(`project.js`)) {
    g.config.eslint = new ESLintConfig(config, g);
    await g.config.eslint.load();
  }

  g.services.circle = new CircleService(config, g);

  await g.config.package.setup();
  await g.config.circle.setup();
  await g.config.editorconfig.setup();
  await g.config.eslint.setup();
  await g.config.readme.setup();

  await deployment.setup();

  await config.save();

  await Promise.all([
    g.config.circle.save(),
    g.config.editorconfig.save(),
    g.config.eslint.save(),
    g.config.package.save(),
    g.config.readme.save()
  ]);

  await g.config.package.installIfNeeded();
}
