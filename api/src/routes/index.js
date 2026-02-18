const express = require('express');
const router = express.Router();

// Import versioned routes
const v1Routes = require('./v1');

// Mount versioned routes - v1 only
router.use('/v1', v1Routes);

module.exports = router;
