const express = require('express');
const router = express.Router();
const ProviderController = require('../../controllers/providerController');
const { uploadClinicPhotos } = require('../../controllers/providerController');

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
router.post('/', uploadClinicPhotos, ProviderController.createProvider);

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Get all providers
 *     tags: [Providers]
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by specialty
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
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
 */
router.get('/', ProviderController.getAllProviders);

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
router.get('/:id', ProviderController.getProviderById);

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
router.put('/:id', uploadClinicPhotos, ProviderController.updateProvider);

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
router.delete('/:id', ProviderController.deleteProvider);

module.exports = router;
