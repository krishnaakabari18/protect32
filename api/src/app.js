const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/auth');


const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development, or if no origin (curl, mobile, etc.)
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:8080',
      'http://localhost:3050',
      'https://app.protect32.in',
      'http://app.protect32.in',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Also allow any ngrok subdomain
    if (/https?:\/\/.*\.ngrok(-free)?\.app/.test(origin) || /https?:\/\/.*\.ngrok-free\.dev/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'ngrok-skip-browser-warning',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Apply global rate limiting to all API routes
app.use('/api', apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure CORS headers are always present on every response
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  const origin = req.headers.origin;
  // Always reflect the request origin back — no blocking in development
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning, X-HTTP-Method-Override');
  next();
});

// Swagger Documentation
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: -1,   // hide schema models section
    defaultModelExpandDepth: 3,
    docExpansion: 'none',           // start collapsed — click to expand
    operationsSorter: 'alpha',
  },
  customCss: `
    .swagger-ui .opblock-summary { cursor: pointer; }
    .swagger-ui .try-out__btn { background: #4CAF50; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
    .swagger-ui .execute-wrapper .btn.execute { background: #1976D2; }
  `,
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Swagger JSON endpoint
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// CORS debug endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error: Origin not allowed',
      origin: req.headers.origin,
      message: 'This origin is not allowed to access this resource'
    });
  }
  
  // Handle other errors
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
