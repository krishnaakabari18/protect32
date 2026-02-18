const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dentist Management System API',
      version: '1.0.0',
      description: 'Complete API documentation for Dentist Management System with versioning support',
      contact: {
        name: 'API Support',
        email: 'support@dentist.com'
      }
    },
    servers: [
      {
        url: `https://abbey-stateliest-treva.ngrok-free.dev/api/v1`,
        description: 'Production server - API v1'
      },
      {
        url: `http://localhost:${process.env.PORT || 8080}/api/v1`,
        description: 'Development server - API v1'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      parameters: {
        ngrokHeader: {
          name: 'ngrok-skip-browser-warning',
          in: 'header',
          required: false,
          schema: {
            type: 'string',
            default: 'true'
          },
          description: 'Skip ngrok browser warning (for ngrok free tier)'
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints (login, register, OTP, social login)' },
      { name: 'Users', description: 'User management' },
      { name: 'Providers', description: 'Provider/Dentist management' },
      { name: 'Patients', description: 'Patient management' },
      { name: 'Appointments', description: 'Appointment scheduling' },
      { name: 'Plans', description: 'Subscription plans' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Prescriptions', description: 'Prescription management' },
      { name: 'Documents', description: 'Document management' },
      { name: 'Notifications', description: 'Notification system' },
      { name: 'Reviews', description: 'Provider reviews' },
      { name: 'TreatmentPlans', description: 'Treatment plan management' },
      { name: 'Chats', description: 'Chat messaging' }
    ]
  },
  apis: ['./src/routes/v1/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
