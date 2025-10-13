import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Conforma API',
      version: '1.0.0',
      description: 'API documentation for the Conforma escrow platform.',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
      },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
