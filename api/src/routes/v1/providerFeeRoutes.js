const express = require('express');
const router = express.Router();
const ProviderFeeController = require('../../controllers/providerFeeController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Provider Fees
 *   description: Provider fees and discounts management
 */

/**
 * @swagger
 * /provider-fees:
 *   get:
 *     summary: Get all provider fees
 *     tags: [Provider Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of provider fees
 */
router.get('/', authenticate, ProviderFeeController.getAllFees);

/**
 * @swagger
 * /provider-fees/{id}:
 *   get:
 *     summary: Get provider fee by ID
 *     tags: [Provider Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider fee details
 */
router.get('/:id', authenticate, ProviderFeeController.getFeeById);

/**
 * @swagger
 * /provider-fees/provider/{providerId}:
 *   get:
 *     summary: Get all fees for a specific provider
 *     tags: [Provider Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of provider fees
 */
router.get('/provider/:providerId', authenticate, ProviderFeeController.getFeesByProvider);

/**
 * @swagger
 * /provider-fees:
 *   post:
 *     summary: Create a new provider fee
 *     tags: [Provider Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider_id
 *               - procedure
 *               - fee
 *             properties:
 *               provider_id:
 *                 type: string
 *               procedure:
 *                 type: string
 *               fee:
 *                 type: number
 *               discount_percent:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [approved, pending]
 *     responses:
 *       201:
 *         description: Provider fee created
 */
router.post('/', authenticate, ProviderFeeController.createFee);

/**
 * @swagger
 * /provider-fees/bulk-upsert:
 *   post:
 *     summary: Bulk create or update provider fees
 *     tags: [Provider Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider_id
 *               - fees
 *             properties:
 *               provider_id:
 *                 type: string
 *               fees:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     procedure:
 *                       type: string
 *                     fee:
 *                       type: number
 *                     discount_percent:
 *                       type: integer
 *                     status:
 *                       type: string
 *     responses:
 *       200:
 *         description: Provider fees updated
 */
router.post('/bulk-upsert', authenticate, ProviderFeeController.bulkUpsertFees);

/**
 * @swagger
 * /provider-fees/{id}:
 *   put:
 *     summary: Update a provider fee
 *     tags: [Provider Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Provider fee updated
 */
router.put('/:id', authenticate, ProviderFeeController.updateFee);

/**
 * @swagger
 * /provider-fees/{id}:
 *   delete:
 *     summary: Delete a provider fee
 *     tags: [Provider Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider fee deleted
 */
router.delete('/:id', authenticate, ProviderFeeController.deleteFee);

module.exports = router;
