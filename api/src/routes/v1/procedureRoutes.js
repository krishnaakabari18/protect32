const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../../middleware/auth');

// Import controller
const ProcedureController = require('../../controllers/procedureController');

/**
 * @swagger
 * tags:
 *   name: Procedures
 *   description: Dental procedures management
 */

/**
 * @swagger
 * /procedures/by-category:
 *   get:
 *     summary: Get procedures grouped by category (for dropdowns)
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Procedures grouped by category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                         example: "Diagnostic & Preventive"
 *                       procedures:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             name:
 *                               type: string
 *                               example: "Check up (Exam)"
 *                             description:
 *                               type: string
 *                             category:
 *                               type: string
 *                             is_active:
 *                               type: boolean
 */
router.get('/by-category', AuthMiddleware.authenticate, ProcedureController.getByCategory);

/**
 * @swagger
 * /procedures/categories:
 *   get:
 *     summary: Get all procedure categories
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Diagnostic & Preventive", "Restorative", "Endodontic"]
 */
router.get('/categories', AuthMiddleware.authenticate, ProcedureController.getCategories);

/**
 * @swagger
 * /procedures/with-price-range:
 *   get:
 *     summary: Get all active procedures with min/max price from treatment plans
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns all active procedures with their minimum and maximum estimated cost
 *       calculated from treatment plans where the procedure appears in the diagnosis field.
 *       Useful for procedure dropdowns with price range display.
 *     responses:
 *       200:
 *         description: List of active procedures with price range
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
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Root Canal
 *                       category:
 *                         type: string
 *                       min_price:
 *                         type: number
 *                         nullable: true
 *                         example: 1500
 *                       max_price:
 *                         type: number
 *                         nullable: true
 *                         example: 5000
 *                 total:
 *                   type: integer
 */
router.get('/with-price-range', AuthMiddleware.authenticate, async (req, res) => {
  try {
    const pool = require('../../config/database');

    // Fetch default description and disclaimer from settings
    const settingsResult = await pool.query(
      "SELECT procedure_default_description, procedure_price_disclaimer FROM settings WHERE id = '00000000-0000-0000-0000-000000000001' LIMIT 1"
    );
    const settings = settingsResult.rows[0] || {};
    const defaultDescription = settings.procedure_default_description ||
      'A routine procedure to remove plaque and tartar buildup, followed by polishing to leave teeth smooth and shiny. Recommended every 6 months.';
    const disclaimer = settings.procedure_price_disclaimer ||
      "This is an estimated cost range. Actual prices may vary based on the clinic, location, dentist's experience, and the complexity of your specific case. Please consult with the dentist for a final quote.";

    const result = await pool.query(`
      SELECT
        p.id, p.name, p.category,
        COALESCE(NULLIF(p.description, ''), $1) AS description,
        MIN(tp.estimated_cost) AS min_price,
        MAX(tp.estimated_cost) AS max_price
      FROM procedures p
      LEFT JOIN treatment_plans tp
        ON tp.diagnosis IS NOT NULL AND tp.diagnosis != ''
        AND p.id::text = ANY(
          CASE
            WHEN tp.diagnosis LIKE '[%]' THEN ARRAY(SELECT jsonb_array_elements_text(tp.diagnosis::jsonb))
            WHEN tp.diagnosis LIKE '{%}' THEN ARRAY(SELECT unnest(tp.diagnosis::text[]))
            ELSE ARRAY[]::text[]
          END
        )
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.category, p.description
      ORDER BY p.name ASC
    `, [defaultDescription]);

    res.json({
      data: result.rows,
      total: result.rows.length,
      disclaimer,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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
 *           format: uuid
 *     responses:
 *       200:
 *         description: Procedure details
 *       404:
 *         description: Procedure not found
 */
router.get('/:id', AuthMiddleware.authenticate, ProcedureController.getById);

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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in procedure names
 *     responses:
 *       200:
 *         description: List of procedures
 */
router.get('/', AuthMiddleware.authenticate, ProcedureController.getAll);

/**
 * @swagger
 * /procedures:
 *   post:
 *     summary: Create new procedure
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
 *               - category
 *               - name
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Diagnostic & Preventive"
 *               name:
 *                 type: string
 *                 example: "Check up (Exam)"
 *               description:
 *                 type: string
 *                 example: "Routine dental examination"
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Procedure created successfully
 */
router.post('/', AuthMiddleware.authenticate, ProcedureController.create);

/**
 * @swagger
 * /procedures/{id}:
 *   put:
 *     summary: Update procedure
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Procedure updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, ProcedureController.update);

/**
 * @swagger
 * /procedures/{id}:
 *   delete:
 *     summary: Delete procedure
 *     tags: [Procedures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Procedure deleted successfully
 */
router.delete('/:id', AuthMiddleware.authenticate, ProcedureController.delete);

module.exports = router;
