const sharp = require('sharp');
const fs = require('fs');

const images = [
  'src/assets/tulip icon.jpeg',
  'src/assets/Spanish cartoon emblem.jpeg',
  'src/assets/sareh emblem.jpeg',
];

async function getImageInfo(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const fileSizeInBytes = fs.statSync(imagePath).size;
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);

    return {
      path: imagePath,
      width: metadata.width,
      height: metadata.height,
      fileSizeKB: fileSizeInKB,
    };
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error.message);
    return null;
  }
}

(async () => {
  for (const image of images) {
    const info = await getImageInfo(image);
    if (info) {
      console.log(`Image: ${info.path}`);
      console.log(`  Dimensions: ${info.width}x${info.height}`);
      console.log(`  File Size: ${info.fileSizeKB} KB`);
      console.log('-------------------------');
    }
  }
})();
