import inquirer from 'inquirer';

export default class Service {
  constructor(config, g) {
    this.config = config;
    this.g = g;
  }

  async prompt() {
    const answers = await inquirer.prompt(this.prompts());
    this.config.merge(answers);
  }

  prompts() {
    return [];
  }
}
