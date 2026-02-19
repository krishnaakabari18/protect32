const express = require('express');
const router = express.Router();
const ProcedureController = require('../../controllers/procedureController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Procedures
 *   description: Dental procedures master data management
 */

/**
 * @swagger
 * /procedures:
 *   get:
 *     summary: Get all procedures
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of procedures
 */
router.get('/', authenticate, ProcedureController.getAllProcedures);

/**
 * @swagger
 * /procedures/{id}:
 *   get:
 *     summary: Get procedure by ID
 *     tags: [Procedures]
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
 *         description: Procedure details
 */
router.get('/:id', authenticate, ProcedureController.getProcedureById);

/**
 * @swagger
 * /procedures:
 *   post:
 *     summary: Create a new procedure
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Procedure created
 */
router.post('/', authenticate, ProcedureController.createProcedure);

/**
 * @swagger
 * /procedures/{id}:
 *   put:
 *     summary: Update a procedure
 *     tags: [Procedures]
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
 *         description: Procedure updated
 */
router.put('/:id', authenticate, ProcedureController.updateProcedure);

/**
 * @swagger
 * /procedures/{id}:
 *   delete:
 *     summary: Delete a procedure
 *     tags: [Procedures]
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
 *         description: Procedure deleted
 */
router.delete('/:id', authenticate, ProcedureController.deleteProcedure);

module.exports = router;
