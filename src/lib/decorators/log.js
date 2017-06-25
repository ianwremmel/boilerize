import {wrap} from 'lodash/fp';

export default function log(options) {
  return function logDecorator(target, prop, descriptor) {
    options = Object.assign({
      before: `${target.constructor.name}#${prop}: starting`,
      success: `${target.constructor.name}#${prop}: succeeded`,
      failure: `${target.constructor.name}#${prop}: failed`
    }, options);

    descriptor.value = wrap(function logWrapper(fn, ...args) {
      /* eslint-disable no-invalid-this */
      console.info(options.before);
      try {
        const res = Reflect.apply(fn, this, args);
        if (res && res.then) {
          return res
            .then(logSuccessAndReturnResult)
            .catch(logFailureAndRethrow);
        }

        return logSuccessAndReturnResult(res);
      }
      catch (reason) {
        logFailureAndRethrow(reason);
        throw new Error(`Unreachable code reached`);
      }
      /* eslint-enable no-invalid-this */
    }, descriptor.value);

    function logSuccessAndReturnResult(result) {
      console.info(options.success);

      return result;
    }

    function logFailureAndRethrow(reason) {
      console.warn(options.failure, reason);
      throw reason;
    }
  };
}
