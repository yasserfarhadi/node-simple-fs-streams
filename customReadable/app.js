const { Readable } = require('node:stream');
const fs = require('node:fs');

class FileReadStream extends Readable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });

    this.fileName = fileName;
    this.fd = null;
  }

  _construct(callback) {
    fs.open(this.fileName, 'r', (error, fd) => {
      if (error) {
        return callback(error);
      }

      this.fd = fd;
      callback();
    });
  }

  _read(size) {
    const buf = Buffer.alloc(size);
    fs.read(this.fd, buf, 0, size, null, (error, bytesRead) => {
      if (error) {
        return this.destroy(error);
      }
      // null is to indicate the end of stream
      this.push(bytesRead > 0 ? buf.subarray(0, bytesRead) : null);
    });
  }

  _destroy(error, callback) {
    if (this.fd) {
      fs.close(this.fd, (err) => callback(error || err));
    } else {
      callback(error);
    }
  }
}

const stream = new FileReadStream({ fileName: 'test.txt' });
stream.on('data', (chunk) => {
  console.log(chunk.toString('utf-8'));
});

stream.on('end', () => {
  console.log('stream is done reading!');
});
