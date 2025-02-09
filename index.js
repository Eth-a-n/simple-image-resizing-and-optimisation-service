const fastify = require('fastify')({
    logger: {
        level: 'error'
    }
});
const sharp = require('sharp');

fastify.get('/image', async (req, res) => {
  const { width = 1000, quality = 100, path } = req.query;
  const basePath = process.env.BASE_PATH
  const imagePath = `${basePath}${path}`;
  const acceptHeader = req.headers.accept || '';
  let imageFormat = 'image/jpeg';

  if (acceptHeader.includes('image/avif')) {
    imageFormat = 'image/avif';
  }
  else if (acceptHeader.includes('image/webp')) {
    imageFormat = 'image/webp';
  } else if (acceptHeader.includes('image/png')) {
    imageFormat = 'image/png';
  }

  try {
    let response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error(`Image download failed with status: ${response.status}`);
    }

    let arrayBuffer = await response.arrayBuffer();
    let imageBuffer = Buffer.from(arrayBuffer);

    let processedImage = await sharp(imageBuffer)
      .resize(Number(width))
      .toFormat(imageFormat.split('/')[1], { quality: Number(quality) })
      .toBuffer();

    response = null;
    arrayBuffer = null;
    imageBuffer = null;
    
    sharp.cache(false);

    res.header('Content-Type', imageFormat);
    res.header('Vary', 'Content-Type');
    res.header('cache-control', 'max-age=31536000')
    res.send(processedImage);

    processedImage = null;

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

fastify.listen({
    port: 4000,
    host: '0.0.0.0',
  }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});