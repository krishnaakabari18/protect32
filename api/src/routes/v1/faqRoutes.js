const express = require('express');
const router = express.Router();
const FaqController = require('../../controllers/faqController');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.get('/', FaqController.getAll);
router.get('/:id', FaqController.getById);
router.post('/', FaqController.create);
router.put('/:id', FaqController.update);
router.patch('/:id/status', FaqController.updateStatus);
router.delete('/:id', FaqController.delete);

module.exports = router;
