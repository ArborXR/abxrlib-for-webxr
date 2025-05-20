"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crc32 = void 0;
function crc32(data) {
    let crc = 0 ^ (-1);
    const crcTable = getCrcTable();
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
}
exports.crc32 = crc32;
function getCrcTable() {
    const crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        crcTable[n] = c;
    }
    return crcTable;
}
//# sourceMappingURL=crc32.js.map