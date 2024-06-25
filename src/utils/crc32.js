/* eslint-disable */

/*
crc32 · JavaScript Function to Calculate CRC32 of a String
Description
  Below is a JavaScript function to calculate CRC32 of a string. 
  The string can be either ASCII or Unicode. 
  Unicode strings will be encoded in UTF-8. 
  The polynomial used in calculation is 0xedb88320. 
  This polynomial is used in Ethernet, Gzip, PNG, SATA and many other technologies.
*/
const crc32 = (() => {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table.push(c);
  }

  return function (str, crc) {
    str = unescape(encodeURIComponent(str));
    if (!crc) crc = 0;
    crc = crc ^ -1;
    for (let i = 0; i < str.length; i++) {
      const y = (crc ^ str.charCodeAt(i)) & 0xff;
      crc = (crc >>> 8) ^ table[y];
    }
    crc = crc ^ -1;
    return crc >>> 0;
  };
})();

export default crc32;
