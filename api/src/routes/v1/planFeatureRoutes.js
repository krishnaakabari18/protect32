const express = require('express');
const router = express.Router();
const PlanFeatureController = require('../../controllers/planFeatureController');
const { authenticate } = require('../../middleware/auth');

router.get('/', authenticate, PlanFeatureController.getAll);
router.post('/', authenticate, PlanFeatureController.create);
router.put('/:id', authenticate, PlanFeatureController.update);
router.delete('/:id', authenticate, PlanFeatureController.delete);

module.exports = router;
