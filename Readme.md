# Simple image resizing and optimisation service

This service can be used to front any endpoint that serves images. It uses [Sharp](https://sharp.pixelplumbing.com/) for "High performance Node.js image processing" and [Fastify](https://fastify.dev/) for "Fast and low overhead web framework, for Node.js"

To run this application simply run `node --env-file=.env index.js` making sure you set your image storage server in the env file as `BASE_PATH` (see .env.example)

Once the app is running you can make a request on `http://localhost:4000/image`

You need 3 paramaters on your request:
- path - path to file on your image storage server
- width - width you want the image to be (optional - defaults to 1000)
- quality - quality you want the image to be (optional - defaults to 100)

An example url might look like:
`http://localhost:4000/image?path=/html/img_chania.jpg&width=1200&quality=80`

The service will automatically serve the best image format based on what the browser supports.

This comes with a basic Dockerfile, so you can run this app in a Dockerised enviroment, by default this runs on port 4000, to run this using Docker please just run...
1. `docker build -t image-resize-and-optimise-service .`
2. `docker run -p 4000:4000 image-resize-and-optimise-service`