const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrimeTrade API',
      version: '1.0.0',
      description: 'Scalable REST API with JWT Authentication & Role-Based Access Control',
      contact: { name: 'PrimeTrade Team' },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:         { type: 'string', example: '64b8f3c2a1e2d3f4e5a6b7c8', description: 'MongoDB ObjectId' },
            name:       { type: 'string', example: 'John Doe' },
            email:      { type: 'string', format: 'email', example: 'john@example.com' },
            role:       { type: 'string', enum: ['user', 'admin'] },
            is_active:  { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id:          { type: 'string', example: '64b8f3c2a1e2d3f4e5a6b7c9', description: 'MongoDB ObjectId' },
            title:       { type: 'string', example: 'Complete API documentation' },
            description: { type: 'string', example: 'Write Swagger docs for all endpoints' },
            status:      { type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
            priority:    { type: 'string', enum: ['low', 'medium', 'high'] },
            due_date:    { type: 'string', format: 'date', nullable: true, example: '2024-12-31' },
            user_id:     { type: 'string', example: '64b8f3c2a1e2d3f4e5a6b7c8', description: 'MongoDB ObjectId of owner' },
            created_at:  { type: 'string', format: 'date-time' },
            updated_at:  { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred.' },
            errors:  { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'PrimeTrade API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  }));
  app.get('/api/v1/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = { setupSwagger };
