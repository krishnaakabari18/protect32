const express = require('express');
const router = express.Router();
const EducationImageController = require('../../controllers/educationImageController');
const { AuthMiddleware } = require('../../middleware/auth');
const { upload } = require('../../utils/educationImageUpload');

/**
 * @swagger
 * tags:
 *   name: Education Images
 *   description: Inline image upload for patient education content
 */

/**
 * @swagger
 * /education-images/upload:
 *   post:
 *     summary: Upload inline image for editor
 *     tags: [Education Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                 path:
 *                   type: string
 */
router.post('/upload', AuthMiddleware.authenticate, upload.single('image'), EducationImageController.uploadInlineImage);

module.exports = router;
