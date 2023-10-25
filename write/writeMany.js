const fs = require('node:fs/promises');

(async () => {
  console.time('gooz');
  const file = await fs.open('./test.txt', 'a');
  const stream = file.createWriteStream();

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
// console.timeEnd('gooz');

// 500 ms
// not good practice
// (async () => {
//   console.time('gooz');
//   const file = await fs.open('./test.txt', 'a');

//   const stream = file.createWriteStream();
//   for (let i = 0; i < 1000000; i++) {
//     const buf = Buffer.from(` ${i} `, 'utf-8');
//     stream.write(buf);
//     // await file.write(` ${i} `);
//   }
//   console.timeEnd('gooz');
//   file.close();
// })();

// const fs = require('node:fs');
// 4s
// (() => {
//   console.time('gooz');
//   let i = 0;
//   fs.open('./test.txt', 'a', (error, file) => {
//     // while (i < 1000000) {
//     // }
//     const buf = Buffer.from(` a `, 'utf-8');
//     for (let i = 0; i < 1000000; i++) {
//       fs.writeSync(file, buf);
//     }

//     console.timeEnd('gooz');
//     // file.close();
//   });
// })();

// 30s
// (async () => {
//   console.time('gooz');
//   const file = await fs.open('./test.txt', 'a');
//   for (let i = 0; i < 1000000; i++) {
//     await file.write(` ${i} `);
//   }
//   console.timeEnd('gooz');
//   file.close();
// })();
