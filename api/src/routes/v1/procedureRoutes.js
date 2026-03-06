const express = require('express');
const router = express.Router();
const ProcedureController = require('../../controllers/procedureController');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Procedures
 *   description: Dental procedures management
 */

// Public routes (or add authenticateToken if you want them protected)
router.get('/', ProcedureController.getAll);
router.get('/by-category', ProcedureController.getByCategory);
router.get('/categories', ProcedureController.getCategories);
router.get('/:id', ProcedureController.getById);

// Protected routes (require authentication)
router.post('/', authenticateToken, ProcedureController.create);
router.put('/:id', authenticateToken, ProcedureController.update);
router.delete('/:id', authenticateToken, ProcedureController.delete);

module.exports = router;
