const { Writable } = require('node:stream');
const fs = require('node:fs');

class FileWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.writesCount = 0;
  }

  // this will run after the  constructor,
  // and it will put off calling all the other methods
  // untill we call the callback fn
  _construct(callback) {
    fs.open(this.fileName, 'w', (error, fd) => {
      if (error) {
        // having an argument means in callback means that we have an error,
        //and should not proceed;
        callback(error);
      } else {
        this.fd = fd;

        // no arguments means it was successfull
        callback();
      }
    });
  }

  _write(chunk, encoding, callback) {
    // write operation
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (error) => {
        if (error) {
          return callback(error);
        }
        this.chunks = [];
        this.chunksSize = 0;
        ++this.writesCount;
        callback();
      });
    } else {
      callback();
    }
  }

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (error) => {
      if (error) {
        return callback(error);
      } else {
        this.chunks = [];
        ++this.writesCount;
        this.chunksSize = 0;
        callback();
      }
    });
  }

  _destroy(error, callback) {
    console.log('Number of Writes:', this.writesCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

(async () => {
  console.time('gooz');
  const stream = new FileWriteStream({
    fileName: 'test.txt',
  });

  let count = 0;
  const max = 1000000;

  stream.on('drain', () => {
    writeToFile();
  });
  stream.on('finish', () => {
    console.log('finish');
    console.timeEnd('gooz');
  });
  function writeToFile() {
    while (count < max) {
      const buf = Buffer.from(`${count} `, 'utf-8');
      const shouldWrite = stream.write(buf);

      count++;
      if (!shouldWrite) {
        break;
      }
    }
    if (count === max) {
      console.log('fn body');
      console.log(count);
      stream.end();
    }
  }
  writeToFile();

  // file.close();
})();
