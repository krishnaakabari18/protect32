const express = require('express');
const router = express.Router();
const CmsPageController = require('../../controllers/cmsPageController');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.get('/', CmsPageController.getAll);
router.get('/:id', CmsPageController.getById);
router.post('/', CmsPageController.create);
router.put('/:id', CmsPageController.update);
router.patch('/:id/status', CmsPageController.updateStatus);
router.delete('/:id', CmsPageController.delete);

module.exports = router;
