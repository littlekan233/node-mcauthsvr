/* 
 * Origin by @ErnestoRB (GitHub)
 * ----- * modified * -----
**/

const createHash = require('crypto').createHash;

function createUUID(name, split = true) {
  if (typeof name !== 'string') {
    throw new TypeError("'name' should be a string!");
  }
  return new Promise((res, rej) => {
    setTimeout(() => {
      const hash = createHash('md5'); // v3
      hash.once('readable', () => {
        const data = hash.read();
        const uuid = [...data];
        // https://www.rfc-editor.org/rfc/rfc4122#section-4.3
        uuid[6] = (data[6] & 0x0f) | 0x30; // v3
        uuid[8] = (data[8] & 0x3f) | 0x80;
        // Origin:
        //res(splittedUUID(toHexString(uuid)));
        // Modified: 
        if(split) res(splittedUUID(toHexString(uuid)));
        res(toHexString(uuid));
      });
      hash.on("error", rej)
      hash.write('OfflinePlayer:' + name);
      hash.end();
    }, []);
  });
}

function toHexString(byteArray) {
  return byteArray
    .map((byte) => ('0' + (byte & 0xff).toString(16)).slice(-2))
    .join('');
}

function splittedUUID(uuid) {
  return [
    uuid.substring(0, 8),
    uuid.substring(8, 12),
    uuid.substring(12, 16),
    uuid.substring(16, 20),
    uuid.substring(20, 32),
  ].join('-');
}

module.exports = {
  createUUID,
};
