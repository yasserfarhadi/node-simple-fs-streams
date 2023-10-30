const { Duplex } = require('node:stream');
const fs = require('node:fs');

class DuplexStream extends Duplex {
  constructor({
    writableHighWaterMark,
    readableHighWaterMark,
    readFileName,
    writeFileName,
  }) {
    super({ writableHighWaterMark, readableHighWaterMark });

    this.readFileName = readFileName;
    this.writeFileName = writeFileName;
    this.readFd = null;
    this.writeFd = null;
    this.chunks = [];
    this.chunksSize = 0;
  }

  _construct(callback) {
    fs.open(this.readFileName, 'r', (error, readFd) => {
      if (error) {
        return callback(error);
      }

      this.readFd = readFd;
      fs.open(this.writeFileName, 'w', (error, writeFd) => {
        if (error) return callback(error);
        this.writeFd = writeFd;
        callback();
      });
    });
  }
  _write(chunk, encoding, callback) {
    // write operation
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(this.writeFd, Buffer.concat(this.chunks), (error) => {
        if (error) {
          return callback(error);
        }
        this.chunks = [];
        this.chunksSize = 0;
        callback();
      });
    } else {
      callback();
    }
  }
  _read(size) {
    const buf = Buffer.alloc(size);
    fs.read(this.readFd, buf, 0, size, null, (error, bytesRead) => {
      if (error) {
        return this.destroy(error);
      }
      // null is to indicate the end of stream
      this.push(bytesRead > 0 ? buf.subarray(0, bytesRead) : null);
    });
  }

  _final(callback) {
    fs.write(this.writeFd, Buffer.concat(this.chunks), (error) => {
      if (error) {
        return callback(error);
      } else {
        this.chunks = [];
        this.chunksSize = 0;
        callback();
      }
    });
  }

  _destroy(error, callback) {
    callback(error);
  }
}

const duplex = new DuplexStream({
  readFileName: 'read.txt',
  writeFileName: 'write.txt',
});

duplex.write(Buffer.from('this is a string!'));
duplex.write(Buffer.from('this is a string!1'));
duplex.write(Buffer.from('this is a string!2'));
duplex.write(Buffer.from('this is a string!3'));
duplex.write(Buffer.from('this is a string!4'));
duplex.end(Buffer.from('this is a string! end'));

duplex.on('data', (chunk) => {
  console.log(chunk.toString('utf-8'));
});
