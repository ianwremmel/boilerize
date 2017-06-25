import {wrap} from 'lodash/fp';

export default function cache({
  secret, service, name
}) {
  if (secret && !service) {
    throw new Error(`\`service\` must be supplied for caching secrets`);
  }

  if (!name) {
    throw new Error(`\`name\` is a required parameter`);
  }

  return function cacheDecorator(target, prop, descriptor) {
    descriptor.value = wrap(async function cacheWrapper(fn, ...args) {
      /* eslint-disable no-invalid-this */
      let value;
      if (secret) {
        value = this.g.secrets.get(service, name);
      }
      else {
        value = this.config.get(name);
      }

      if (value) {
        return value;
      }

      value = await Reflect.apply(fn, this, args);
      if (secret) {
        this.g.secrets.set(service, name, value);
      }
      else {
        this.config.set(name, value);
      }

      return value;
      /* eslint-enable no-invalid-this */
    }, descriptor.value);
  };
}
