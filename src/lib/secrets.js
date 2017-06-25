function makeKey(service) {
  return `boilerize-${service}`;
}

export default class Secrets {
  constructor() {
    try {
      this.keytar = require(`keytar`);
    }
    catch (e) {
      console.warn(`keytar could not be loaded; passwords will be kept in memory`);
    }
  }

  get(service, username) {
    if (this.keytar) {
      return this.keytar.getPassword(makeKey(service), username);
    }

    return null;
  }

  set(service, username, password) {
    if (this.keytar) {
      this.keytar.replacePassword(makeKey(service), username, password);
    }
  }
}
