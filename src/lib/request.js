import request from 'request-promise';

export default async function(options) {
  const result = await request(Object.assign({
    json: true,
    resolveWithFullResponse: true
  }, options));
  if (result.statusCode >= 400) {
    console.warn(result.body);
    throw new Error(`request failed ${result.statusCode}`);
  }

  return result;
}
