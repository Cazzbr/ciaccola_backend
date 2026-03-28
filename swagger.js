import fs from 'fs';
import swaggerAutogen from 'swagger-autogen';

const doc = {
  openapi: '3.0.0',
  info: {
    title: 'Ciaccola Backend API',
    description: 'JWT protected backend API for user management, contacts, and messaging.',
    version: '1.0.0'
  },
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User profile and contact management' },
    { name: 'Messages', description: 'Message creation and deletion' }
  ],
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
const endpointsFiles = ['./server.js', './src/routes/*.js'];  // Your files

// Force OpenAPI 3.0
const fnSwaggerAutogen = swaggerAutogen({ openapi: '3.0.0' });
await fnSwaggerAutogen(outputFile, endpointsFiles, doc);

const swaggerRaw = await fs.promises.readFile(outputFile, 'utf8');
const swaggerDoc = JSON.parse(swaggerRaw);

const tagForPath = (path) => {
  if (path.startsWith('/api/auth')) return ['Auth'];
  if (path.startsWith('/api/users')) return ['Users'];
  if (path.startsWith('/api/messages')) return ['Messages'];
  return ['Default'];
};

swaggerDoc.paths = Object.fromEntries(
  Object.entries(swaggerDoc.paths)
    .filter(([path]) => path.startsWith('/api/'))
    .map(([path, methods]) => [
      path,
      Object.fromEntries(
        Object.entries(methods).map(([method, operation]) => {
          if (!operation.tags) {
            operation.tags = tagForPath(path);
          }
          return [method, operation];
        })
      )
    ])
);

await fs.promises.writeFile(outputFile, JSON.stringify(swaggerDoc, null, 2));

console.log('Swagger JSON generated! Starting server...');
await import('./server.js');