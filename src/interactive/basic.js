import npm from 'npm';
import Service from '../lib/service';

export default class Basic extends Service {
  prompts() {
    return [{
      default: true,
      message: `Is this a JavaScript project?`,
      name: `project.js`,
      type: `confirm`,
      when: (answers) => {
        this.config.merge(answers);

        return !this.config.has(`project.js`);
      }
    }, {
      default: false,
      message: `Is this a React project?`,
      name: `project.react`,
      type: `confirm`,
      when: (answers) => {
        this.config.merge(answers);

        return !this.config.has(`project.react`) && this.config.get(`project.js`);
      }
    }, {
      default: false,
      message: `Does this project use es6 imports?`,
      name: `project.eslint.imports`,
      type: `confirm`,
      when: (answers) => {
        this.config.merge(answers);

        return !this.config.has(`project.eslint.imports`) && this.config.get(`project.js`);
      }
    }, {
      default: true,
      message: `Is this project on Github?`,
      name: `project.github`,
      type: `confirm`,
      when: (answers) => {
        this.config.merge(answers);

        return !this.config.has(`project.github`);
      }
    },
    {
      default: npm.config.get(`username`),
      message: `What is your GitHub username?`,
      name: `github.org`,
      type: `input`,
      validate(input) {
        return !!input.length;
      },
      when: (answers) => {
        this.config.merge(answers);

        return this.config.get(`project.github`) && !this.config.has(`github.org`);
      }
    },
    {
      message: `What is the project's GitHub repo name?`,
      name: `github.project`,
      type: `input`,
      validate(input) {
        return !!input.length;
      },
      when: (answers) => {
        this.config.merge(answers);

        return this.config.get(`project.github`) && !this.config.has(`github.project`);
      }
    }];
  }
}
