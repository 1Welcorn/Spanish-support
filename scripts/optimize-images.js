const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');

(async () => {
  const files = fs.readdirSync(ASSETS_DIR).filter(f => /\.(png|jpe?g)$/i.test(f));
  console.log('Found', files.length, 'image files');

  for (const file of files) {
    const full = path.join(ASSETS_DIR, file);
    const stat = fs.statSync(full);
    const sizeKB = stat.size / 1024;

    // Only optimize files larger than 80 KB
    if (sizeKB < 80) {
      console.log(`Skipping ${file} (${Math.round(sizeKB)} KB) — already small`);
      continue;
    }

    try {
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file, ext);
      const tmpOut = path.join(ASSETS_DIR, `${name}.opt.jpg`);

      // Resize to max width 600, keep aspect ratio, recompress to JPEG quality 70
      await sharp(full)
        .resize({ width: 600, withoutEnlargement: true })
        .jpeg({ quality: 70, progressive: true })
        .toFile(tmpOut);

      const newStat = fs.statSync(tmpOut);
      console.log(`${file}: ${Math.round(sizeKB)} KB -> ${Math.round(newStat.size / 1024)} KB`);

      // Replace original file with optimized JPG
      fs.unlinkSync(full);
      fs.renameSync(tmpOut, full.replace(/\.(png|jpe?g)$/i, '.jpeg'));

    } catch (err) {
      console.error('Error optimizing', file, err);
    }
  }

  console.log('Optimization complete');
})();
