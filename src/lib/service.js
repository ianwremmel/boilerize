export default class Service {
  constructor(config, dependencies) {
    this.config = config;
    if (dependencies) {
      Object.keys(dependencies).forEach((key) => {
        this[key] = dependencies[key];
      });
    }
  }
}
