const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const medicationAIController = require('../../controllers/medicationAIController');

/**
 * @swagger
 * tags:
 *   name: Medication AI
 *   description: AI-powered medication suggestions using Google Gemini
 */

/**
 * @swagger
 * /medication-ai/suggestions:
 *   get:
 *     summary: Get medication suggestions from Google AI
 *     tags: [Medication AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication search query (e.g., "Paracetamol")
 *     responses:
 *       200:
 *         description: List of medication suggestions
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
 *                       name:
 *                         type: string
 *                       genericName:
 *                         type: string
 *                       commonDosages:
 *                         type: array
 *                         items:
 *                           type: string
 *                       commonUses:
 *                         type: string
 *                       frequency:
 *                         type: string
 */
router.get('/suggestions', authenticate, medicationAIController.getMedicationSuggestions);

module.exports = router;
