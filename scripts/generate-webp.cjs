const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');

(async () => {
  const files = fs.readdirSync(ASSETS_DIR).filter(f => /\.(png|jpe?g)$/i.test(f));
  console.log('Converting', files.length, 'images to WebP');

  for (const file of files) {
    const full = path.join(ASSETS_DIR, file);
    const name = path.basename(file, path.extname(file));
    const out = path.join(ASSETS_DIR, `${name}.webp`);

    try {
      await sharp(full)
        .webp({ quality: 75 })
        .toFile(out);
      console.log('Created', out);
    } catch (err) {
      console.error('Error converting', file, err);
    }
  }

  console.log('WebP generation complete');
})();
