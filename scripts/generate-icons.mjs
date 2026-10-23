// scripts/generate-icons.mjs — 純 Node 產生 PWA icon（192/512 PNG，無 canvas 依賴）。
// 設計：zen 深綠底 + 金色圓環（命理「輪轉」意象）。
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function makePng(size) {
  const px = Buffer.alloc(size * size * 3);
  const bg = [28, 33, 31];        // #1C211F zen 深綠
  const gold = [212, 168, 83];    // #D4A853 zen gold
  const cx = (size - 1) / 2;
  const rOuter = size * 0.36;
  const rInner = size * 0.24;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cx);
      // 抗鋸齒：邊緣 1px 線性混合
      const [r, g, b] = gold;
      const [br, bgb, bb] = bg;
      let color;
      if (d <= rInner) color = [br, bgb, bb];
      else if (d >= rOuter) color = [br, bgb, bb];
      else if (d <= rInner + 1 || d >= rOuter - 1) {
        const t = Math.min(1, Math.max(0, (d - rInner) / (rOuter - rInner)));
        color = [
          Math.round(br + (r - br) * t),
          Math.round(bgb + (g - bgb) * t),
          Math.round(bb + (b - bb) * t),
        ];
      } else color = gold;
      const i = (y * size + x) * 3;
      px[i] = color[0]; px[i + 1] = color[1]; px[i + 2] = color[2];
    }
  }
  // scanlines：每列前加 filter byte 0
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    px.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', makePng(192));
writeFileSync('public/icon-512.png', makePng(512));
writeFileSync('public/icon-180.png', makePng(180));
writeFileSync('public/icon.svg',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
  '<rect width="512" height="512" fill="#1C211F"/>' +
  '<circle cx="256" cy="256" r="184" fill="none" stroke="#D4A853" stroke-width="64"/></svg>');
console.log('icons written: public/icon-192.png, public/icon-512.png, public/icon.svg');
