const fs = require('node:fs/promises');
const { pipeline } = require('node:stream');

(async () => {
  console.time('copy');
  const srcFile = await fs.open('test.txt', 'r');
  const destFile = await fs.open('test-copy.txt', 'w');

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  pipeline(readStream, writeStream, (error) => {
    console.log(error);
    console.timeEnd('copy');
  });
})();
// (async () => {
//   console.time('copy');
//   const srcFile = await fs.open('test.txt', 'r');

//   const destFile = await fs.open('test-copy.txt', 'w');

//   const readStream = srcFile.createReadStream();
//   const writeStream = destFile.createWriteStream();

//   readStream.pipe(writeStream);
//   readStream.on('end', () => {
//     console.timeEnd('copy');
//   });
//   // console.log(chunk);
//   // await destFile.write(result);
// })();

// (async () => {
//   console.time('copy');
//   const srcFile = await fs.open('test.txt', 'r');

//   const destFile = await fs.open('test-copy.txt', 'w');

//   let bytesRead = -1;
//   while (bytesRead !== 0) {
//     const readChunk = await srcFile.read();
//     bytesRead = readChunk.bytesRead;
//     if (bytesRead !== 16384) {
//       const emplyIndex = readChunk.buffer.indexOf(0);
//       const newBuffer = Buffer.alloc(emplyIndex);
//       readChunk.buffer.copy(newBuffer, 0, 0, emplyIndex);
//       destFile.write(newBuffer);
//     } else {
//       destFile.write(readChunk.buffer);
//     }
//   }

//   // console.log(chunk);
//   // await destFile.write(result);
//   console.timeEnd('copy');
// })();

// (async () => {
//   const destFile = await fs.open('text-copy.text', 'w');
//   const result = await fs.readFile('test.txt');
//   await destFile.write(result);
// })();
