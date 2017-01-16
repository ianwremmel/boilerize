import {difference} from 'lodash/fp';

export function sort(order, obj) {
  const unknownKeys = difference(Object.keys(obj), order).sort();

  return unknownKeys.reduce(sorter, order.reduce(sorter, {}));

  function sorter(acc, key) {
    if (obj[key]) {
      acc[key] = obj[key];
    }
    return acc;
  }
}
