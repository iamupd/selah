const { Jimp } = require('jimp');
const path = require('path');

async function resizeIcons() {
    try {
        const inputPath = path.join(__dirname, 'public', 'selah-icon.png');

        console.log(`Reading image from ${inputPath}...`);
        // Jimp 1.x 방식: Jimp.read()
        const image = await Jimp.read(inputPath);

        // 192x192
        console.log('Generating icon-192.png...');
        await image
            .clone()
            .resize({ w: 192, h: 192 }) // 최신 resize 문법 확인 필요하나, 보통 resize(w, h)
            .write(path.join(__dirname, 'public', 'icon-192.png'));

        // 512x512
        console.log('Generating icon-512.png...');
        await image
            .clone()
            .resize({ w: 512, h: 512 })
            .write(path.join(__dirname, 'public', 'icon-512.png'));

        // 180x180 (Apple Touch Icon)
        console.log('Generating apple-icon.png...');
        await image
            .clone()
            .resize({ w: 180, h: 180 })
            .write(path.join(__dirname, 'public', 'apple-icon.png'));

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

resizeIcons();
