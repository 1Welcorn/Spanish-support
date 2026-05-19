const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');
const TARGETS = [
  'tulip icon.jpeg',
  'Spanish cartoon emblem.jpeg',
  'sareh emblem.jpeg'
];

(async () => {
  for (const file of TARGETS) {
    const input = path.join(ASSETS_DIR, file);
    console.log('Processing', input);
    if (!fs.existsSync(input)) {
      console.log('Missing', input);
      continue;
    }

    try {
      const img = sharp(input);
      const meta = await img.metadata();
      console.log('Meta:', meta.width, 'x', meta.height, 'channels', meta.channels);

      const small = sharp(input).resize(200).ensureAlpha().raw();
      const smallBufObj = await small.toBuffer({ resolveWithObject: true });
      const buf = smallBufObj.data;
      const w = smallBufObj.info.width;
      const h = smallBufObj.info.height;
      const ch = smallBufObj.info.channels;

      const samplePx = (x, y) => {
        const idx = (y * w + x) * ch;
        return [buf[idx], buf[idx+1], buf[idx+2]];
      };

      const sampleArea = (sx, sy, size=10) => {
        const res = [0,0,0];
        let count = 0;
        for (let yy=sy; yy<Math.min(sy+size, h); yy++) {
          for (let xx=sx; xx<Math.min(sx+size, w); xx++) {
            const p = samplePx(xx, yy);
            res[0]+=p[0]; res[1]+=p[1]; res[2]+=p[2];
            count++;
          }
        }
        return [Math.round(res[0]/count), Math.round(res[1]/count), Math.round(res[2]/count)];
      };

      const corners = [
        sampleArea(0,0),
        sampleArea(w-10,0),
        sampleArea(0,h-10),
        sampleArea(w-10,h-10)
      ];
      const avg = [0,0,0];
      for (const c of corners) { avg[0]+=c[0]; avg[1]+=c[1]; avg[2]+=c[2]; }
      avg[0]=Math.round(avg[0]/4); avg[1]=Math.round(avg[1]/4); avg[2]=Math.round(avg[2]/4);
      console.log('Avg corner color:', avg);

      const threshold = 120;
      const inImg = sharp(input).ensureAlpha().raw();
      const { data, info } = await inImg.toBuffer({ resolveWithObject: true });
      console.log('Full image info', info.width, 'x', info.height, 'channels', info.channels);

      const out = Buffer.from(data);
      for (let y=0; y<info.height; y++) {
        for (let x=0; x<info.width; x++) {
          const idx = (y*info.width + x) * info.channels;
          const r = data[idx], g = data[idx+1], b = data[idx+2];
          const dist = Math.sqrt((r-avg[0])**2 + (g-avg[1])**2 + (b-avg[2])**2);
          if (dist < threshold) {
            out[idx+3] = 0;
          } else {
            out[idx+3] = data[idx+3] || 255;
          }
        }
      }

      const outName = path.join(ASSETS_DIR, path.basename(file, path.extname(file)) + '-nobg.png');
      await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toFile(outName);
      console.log('Saved', outName);
    } catch (err) {
      console.error('Error processing', file, err && err.stack ? err.stack : err);
    }
  }
  console.log('Done');
})();