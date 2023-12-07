/**
 * Create an object composed of the picked object properties
 * @param {T} object
 * @param {K[]} keys
 * @returns {Pick<T, K>}
 */
function pick<T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {} as Pick<T, K>);
}

export default pick;