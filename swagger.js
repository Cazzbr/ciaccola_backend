import swaggerAutogen from 'swagger-autogen';

const doc = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    description: 'JWT protected API docs',
    version: '1.0.0'
  },
  servers: [{ 
    url: 'http://localhost:3000',
    description: 'Development server'
  }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste "Bearer <your-jwt-token>"'
      }
    }
  },
  security: [{ bearerAuth: [] }]  // Global auth
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js', './routes/*.js'];  // Your files

// Force OpenAPI 3.0
const fnSwaggerAutogen = swaggerAutogen({ openapi: '3.0.0' });
await fnSwaggerAutogen(outputFile, endpointsFiles, doc);

console.log('Swagger JSON generated! Starting server...');
await import('./server.js');