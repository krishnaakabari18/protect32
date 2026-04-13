const express = require('express');
const router = express.Router();
const ProviderController = require('../../controllers/providerController');
const { uploadClinicPhotos } = require('../../controllers/providerController');
const { AuthMiddleware } = require('../../middleware/auth');
const auth = AuthMiddleware.authenticate;

/**
 * @swagger
 * components:
 *   schemas:
 *     Provider:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         specialty:
 *           type: string
 *         experience_years:
 *           type: integer
 *         clinic_name:
 *           type: string
 *         contact_number:
 *           type: string
 *         location:
 *           type: string
 *         about:
 *           type: string
 *         rating:
 *           type: number
 *         total_reviews:
 *           type: integer
 */

/**
 * @swagger
 * /providers:
 *   post:
 *     summary: Create a new provider
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - specialty
 *               - clinic_name
 *               - contact_number
 *               - location
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: User ID (must exist in users table)
 *               specialty:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *               clinic_name:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               location:
 *                 type: string
 *               coordinates:
 *                 type: object
 *               about:
 *                 type: string
 *               clinic_photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               clinic_video_url:
 *                 type: string
 *               availability:
 *                 type: string
 *     responses:
 *       201:
 *         description: Provider created successfully
 */
router.post('/', auth, uploadClinicPhotos, ProviderController.createProvider);

/**
 * @swagger
 * /providers/list:
 *   post:
 *     summary: Get all providers (with optional filters)
 *     tags: [Providers]
 *     description: |
 *       Returns all providers. Pass filter parameters in the request body to narrow results.
 *       All filters are optional — omit them to get all providers.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keyword:
 *                 type: string
 *                 description: Search by provider name, clinic name, or specialty
 *                 example: "John"
 *               specialty:
 *                 type: string
 *                 example: "Orthodontist"
 *               location:
 *                 type: string
 *                 example: "Mumbai"
 *               pincode:
 *                 type: string
 *                 example: "400001"
 *               min_experience:
 *                 type: integer
 *                 description: Minimum years of experience
 *                 example: 5
 *               min_rating:
 *                 type: number
 *                 description: Minimum average rating (1-5)
 *                 example: 4
 *               daytime:
 *                 type: string
 *                 enum: [morning, afternoon, evening]
 *                 description: Filter by session availability
 *               procedure_id:
 *                 type: string
 *                 format: uuid
 *                 description: Only providers who offer this procedure
 *               page:
 *                 type: integer
 *                 default: 1
 *               limit:
 *                 type: integer
 *                 default: 10
 *     responses:
 *       200:
 *         description: List of providers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Provider'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.post('/list', ProviderController.getAllProviders);

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     summary: Get provider by ID
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Provider details
 *       404:
 *         description: Provider not found
 */
router.get('/:id', auth, ProviderController.getProviderById);

/**
 * @swagger
 * /providers/{id}:
 *   put:
 *     summary: Update provider
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               specialty:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *               clinic_name:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               location:
 *                 type: string
 *               about:
 *                 type: string
 *               availability:
 *                 type: string
 *               clinic_photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               clinic_video_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provider updated successfully
 *       404:
 *         description: Provider not found
 */
router.put('/:id', auth, uploadClinicPhotos, ProviderController.updateProvider);

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     summary: Delete provider
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Provider deleted successfully
 *       404:
 *         description: Provider not found
 */
router.delete('/:id', auth, ProviderController.deleteProvider);

/**
 * @swagger
 * /providers/{id}/images/{imageType}:
 *   delete:
 *     summary: Delete specific provider image
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [clinic_photos, profile_photo, state_dental_council_reg_photo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imagePath:
 *                 type: string
 *                 description: Path of the image to delete
 *               imageIndex:
 *                 type: number
 *                 description: Index of image in array (for clinic_photos)
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Provider or image not found
 */
router.delete('/:id/images/:imageType', auth, ProviderController.deleteProviderImage);

// Get procedures assigned to a specific provider
/**
 * @swagger
 * /providers/{id}/procedures:
 *   get:
 *     summary: Get procedures assigned to a specific provider
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Provider UUID
 *     responses:
 *       200:
 *         description: List of procedures for the provider
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:        { type: string }
 *                       name:      { type: string }
 *                       category:  { type: string }
 *                       price:     { type: number }
 *       404:
 *         description: Provider not found
 */
router.get('/:id/procedures', auth, ProviderController.getProviderProcedures);

module.exports = router;
