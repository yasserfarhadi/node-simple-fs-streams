const fs = require('node:fs/promises');

(async () => {
  console.time('read and write');
  const file = await fs.open('test.txt', 'r');
  const destFile = await fs.open('dest.txt', 'w');

  const streamReed = file.createReadStream({
    highWaterMark: 64 * 1024 /* default */,
  });

  const streamWrite = destFile.createWriteStream();
  let leftover = null;
  streamReed.on('data', (chunk) => {
    let str = chunk.toString('utf-8').split(' ');
    str = str.filter((item) => item !== '');
    if (leftover !== null) {
      str[0] = leftover + str[0];
      leftover = null;
    }
    if (+str[str.length - 2] !== +str[str.length - 1] - 1) {
      leftover = str.splice(str.length - 1, 1)[0].trim();
    }
    str.forEach((strNum) => {
      if (+strNum % 2 === 0) {
        const shouldWrite = streamWrite.write(`${strNum} `);
        if (!shouldWrite) {
          streamReed.pause();
        }
      }
    });
  });

  streamWrite.on('drain', () => {
    streamReed.resume();
  });

  streamReed.on('end', () => {
    console.log('Done Reading');
    file.close();
    destFile.close();
    console.timeEnd('read and write');
  });
})();
