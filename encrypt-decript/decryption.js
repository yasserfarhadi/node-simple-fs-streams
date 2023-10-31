const { Transform } = require('node:stream');
const fs = require('node:fs/promises');

class Decrypt extends Transform {
  _transform(chunk, encoding, callback) {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] - 1;
      }
    }

    callback(null, chunk);
  }
}

(async () => {
  const readFileHandle = await fs.open('write.txt', 'r');
  const writeFileHandle = await fs.open('decripted.txt', 'w');

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const decript = new Decrypt();

  readStream.pipe(decript).pipe(writeStream);
})();
