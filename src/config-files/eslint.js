import {override} from 'core-decorators';
import inquirer from 'inquirer';
import {isString, uniq} from 'lodash/fp';
import ConfigFile from '../lib/config-file';
import log from '../lib/decorators/log';

export default class ESLint extends ConfigFile {
  static FILENAME = `.eslintrc.yml`;

  @log()
  extend(options, rule) {
    if (options.exclusive) {
      this.data.extends = rule;

      return;
    }

    if (isString(this.data.extends)) {
      this.data.extends = [
        this.data.extends,
        rule
      ];

      return;
    }

    this.data.extends = this.data.extends || [];

    this.data.extends.push(rule);
    this.data.extends = uniq(this.data.extends);
  }

  @override
  @log()
  async setup() {
    await inquirer.prompt(this.prompts());

    if (!this.config.get(`project.js`)) {
      return;
    }

    await this.g.config.package.addDevDependency(`pre-commit`);
    await this.g.config.package.addDevDependency(`lint-staged`);
    await this.g.config.package.addDevDependency(`eslint`);
    await this.g.config.package.addDevDependency(`@ianwremmel/eslint-config`);

    await this.g.config.package.addScript(`lint:eslint`, `eslint $([ -n "$CI" ] && echo '--format=junit --output-file=\${CIRCLE_TEST_REPORTS}/eslint.xml' || true) --ignore-path .gitignore`);
    await this.g.config.package.addScript(`lint:js`, `npm run --silent lint:eslint -- .`);
    await this.g.config.package.combineScripts(`lint`, `lint:js`);

    this.g.config.package.set([`lint-staged`, `*.js`], `lint:eslint`);

    if (this.config.get(`project.eslint.imports`)) {
      this.extend({exclusive: true}, `@ianwremmel/eslint-config/es2015-imports`);
    }
    else {
      this.extend({exclusive: true}, `@ianwremmel`);
    }

    if (this.config.get(`project.react`)) {
      this.extend(`@ianwremmel/eslint-config/react`);
    }
  }
}
