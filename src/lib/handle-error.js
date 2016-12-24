export default function handleError(fn) {
  return function errorHandler(...args) {
    return Promise.resolve(fn(...args))
      .catch((err) => {
        console.error(err);
        // eslint-disable-next-line no-process-exit
        process.exit(64);
      });
  };
}
