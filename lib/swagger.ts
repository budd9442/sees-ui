import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SEES Feature & API Documentation',
      version: '1.0.0',
      description: 'Comprehensive documentation for SEES REST APIs and Application Server Actions (Internal Features).',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./app/api/**/*.ts', './lib/actions/**/*.ts'], // Path to the API docs and Server Actions
};

export const swaggerSpec = swaggerJsdoc(options);
