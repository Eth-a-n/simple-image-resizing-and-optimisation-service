const fastify = require('fastify')({
    logger: {
      level: 'error'
    }
  });
  const sharp = require('sharp');
  const fetch = require('node-fetch');
  jest.mock('node-fetch', () => jest.fn());
  jest.mock('sharp');
  
  const imagePath = 'https://cdn.core.homeviews.com/some/image.jpg';
  
  beforeAll(() => {
    fastify.get('/image', async (req, res) => {
      const { width, quality, path } = req.query;
      const imagePath = `https://cdn.core.homeviews.com${path}`;
      const acceptHeader = req.headers.accept || '';
      let imageFormat = 'image/jpeg';
  
      if (acceptHeader.includes('image/avif')) {
        imageFormat = 'image/avif';
      } else if (acceptHeader.includes('image/webp')) {
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
  });
  
  afterAll(() => {
    fastify.close();
  });
  
  describe('GET /image', () => {
    it('should return processed image in jpeg format when no accept header is provided', async () => {
      const mockImageBuffer = Buffer.from('mock-image-data');
      fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      sharp.mockReturnValueOnce({
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      });
  
      const response = await fastify.inject({
        method: 'GET',
        url: '/image?path=/some/image.jpg&width=200&quality=80',
      });
  
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.body).toEqual('mock-image-data');
      expect(fetch).toHaveBeenCalledWith(imagePath);
      expect(sharp).toHaveBeenCalledWith(mockImageBuffer);
    });
  
    it('should return processed image in avif format when accept header contains image/avif', async () => {
      const mockImageBuffer = Buffer.from('mock-image-data');
      fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      sharp.mockReturnValueOnce({
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      });
  
      const response = await fastify.inject({
        method: 'GET',
        url: '/image?path=/some/image.jpg&width=200&quality=80',
        headers: {
          accept: 'image/avif',
        },
      });
  
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('image/avif');
      expect(response.body).toEqual('mock-image-data');
      expect(fetch).toHaveBeenCalledWith(imagePath);
      expect(sharp).toHaveBeenCalledWith(mockImageBuffer);
    });
  
    it('should return processed image in webp format when accept header contains image/webp', async () => {
      const mockImageBuffer = Buffer.from('mock-image-data');
      fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      sharp.mockReturnValueOnce({
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      });
  
      const response = await fastify.inject({
        method: 'GET',
        url: '/image?path=/some/image.jpg&width=200&quality=80',
        headers: {
          accept: 'image/webp',
        },
      });
  
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.body).toEqual('mock-image-data');
      expect(fetch).toHaveBeenCalledWith(imagePath);
      expect(sharp).toHaveBeenCalledWith(mockImageBuffer);
    });
  
    it('should return processed image in png format when accept header contains image/png', async () => {
      const mockImageBuffer = Buffer.from('mock-image-data');
      fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      sharp.mockReturnValueOnce({
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      });
  
      const response = await fastify.inject({
        method: 'GET',
        url: '/image?path=/some/image.jpg&width=200&quality=80',
        headers: {
          accept: 'image/png',
        },
      });
  
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('image/png');
      expect(response.body).toEqual('mock-image-data');
      expect(fetch).toHaveBeenCalledWith(imagePath);
      expect(sharp).toHaveBeenCalledWith(mockImageBuffer);
    });
  
    it('should return 500 if image download fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
  
      const response = await fastify.inject({
        method: 'GET',
        url: '/image?path=/some/image.jpg&width=200&quality=80',
      });
  
      expect(response.statusCode).toBe(500);
      expect(response.body).toBe('Error processing image');
    });
  
    it('should return 500 if there is an error during image processing', async () => {
      const mockImageBuffer = Buffer.from('mock-image-data');
      fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockImageBuffer),
      });
      sharp.mockImplementationOnce(() => {
        throw new Error('Processing error');
      });
  
      const response = await fastify.inject({
        method: 'GET',
        url: '/image?path=/some/image.jpg&width=200&quality=80',
      });
  
      expect(response.statusCode).toBe(500);
      expect(response.body).toBe('Error processing image');
    });
  });  