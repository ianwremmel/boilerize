import inquirer from 'inquirer';
import {isString, uniq} from 'lodash/fp';
import ConfigFile from '../config-file';
import {override} from 'core-decorators';

export default class ESLint extends ConfigFile {
  static FILENAME = `.eslintrc.yml`;

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
  async setup() {
    await inquirer.prompt(this.prompt());

    if (!this.config.get(`project.js`)) {
      return;
    }

    await this.package.addDevDependency(`pre-commit`);
    await this.package.addDevDependency(`lint-staged`);
    await this.package.addDevDependency(`eslint`);
    await this.package.addDevDependency(`@ianwremmel/eslint-config`);

    await this.package.addScript(`lint:eslint`, `eslint --ignore-path .gitignore`);
    await this.package.addScript(`lint:js`, `npm run --silent lint:eslint -- .`);
    await this.package.combineScripts(`lint`, `lint:js`);

    this.package.set([`lint-staged`, `*.js`], `lint:eslint`);

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

  @override
  prompt() {
    return [
      {
        default: true,
        message: `Is this a JavaScript project?`,
        name: `project.js`,
        type: `confirm`,
        when: (answers) => {
          this.config.merge(answers);
          return !this.config.has(`project.js`);
        }
      },
      {
        default: false,
        message: `Is this a React project?`,
        name: `project.react`,
        type: `confirm`,
        when: (answers) => {
          this.config.merge(answers);
          return !this.config.has(`project.react`) && this.config.get(`project.js`);
        }
      },
      {
        default: false,
        message: `Does this project use es6 imports?`,
        name: `project.eslint.imports`,
        type: `confirm`,
        when: (answers) => {
          this.config.merge(answers);
          return !this.config.has(`project.eslint.imports`) && this.config.get(`project.js`);
        }
      }
    ];
  }
}
