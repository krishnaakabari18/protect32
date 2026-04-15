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

/**
 * @swagger
 * /providers/{id}/holidays:
 *   get:
 *     summary: Get all holidays for a provider
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         description: Filter by year (e.g. 2026)
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *         description: Filter by month (1-12)
 *     responses:
 *       200:
 *         description: List of holidays
 *   post:
 *     summary: Add a holiday for a provider
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [holiday_date, title]
 *             properties:
 *               holiday_date: { type: string, format: date }
 *               title:        { type: string }
 *               description:  { type: string }
 *               is_full_day:  { type: boolean, default: true }
 *               start_time:   { type: string, example: "09:00" }
 *               end_time:     { type: string, example: "17:00" }
 *     responses:
 *       201:
 *         description: Holiday added
 */
router.get('/:id/holidays', auth, async (req, res) => {
  try {
    const pool = require('../../config/database');
    let q = 'SELECT * FROM provider_holidays WHERE provider_id = $1';
    const vals = [req.params.id]; let p = 2;
    if (req.query.year)  { q += ` AND EXTRACT(YEAR  FROM holiday_date) = $${p++}`; vals.push(req.query.year); }
    if (req.query.month) { q += ` AND EXTRACT(MONTH FROM holiday_date) = $${p++}`; vals.push(req.query.month); }
    q += ' ORDER BY holiday_date ASC';
    const r = await pool.query(q, vals);
    res.json({ success: true, data: r.rows, total: r.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/holidays', auth, async (req, res) => {
  try {
    const pool = require('../../config/database');
    const { holiday_date, title, description, is_full_day = true, start_time, end_time } = req.body;
    if (!holiday_date || !title) return res.status(400).json({ error: 'holiday_date and title are required' });
    const r = await pool.query(
      `INSERT INTO provider_holidays (provider_id, holiday_date, title, description, is_full_day, start_time, end_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (provider_id, holiday_date) DO UPDATE SET title=$3, description=$4, is_full_day=$5, start_time=$6, end_time=$7, updated_at=NOW()
       RETURNING *`,
      [req.params.id, holiday_date, title, description || null, is_full_day, start_time || null, end_time || null]
    );
    res.status(201).json({ success: true, message: 'Holiday added', data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /providers/{id}/holidays/{holidayId}:
 *   put:
 *     summary: Update a provider holiday
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: holidayId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Holiday updated
 *   delete:
 *     summary: Delete a provider holiday
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: holidayId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Holiday deleted
 */
router.put('/:id/holidays/:holidayId', auth, async (req, res) => {
  try {
    const pool = require('../../config/database');
    const { holiday_date, title, description, is_full_day, start_time, end_time } = req.body;
    const r = await pool.query(
      `UPDATE provider_holidays SET
         holiday_date=COALESCE($1,holiday_date), title=COALESCE($2,title),
         description=$3, is_full_day=COALESCE($4,is_full_day),
         start_time=$5, end_time=$6, updated_at=NOW()
       WHERE id=$7 AND provider_id=$8 RETURNING *`,
      [holiday_date, title, description, is_full_day, start_time, end_time, req.params.holidayId, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Holiday not found' });
    res.json({ success: true, message: 'Holiday updated', data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/holidays/:holidayId', auth, async (req, res) => {
  try {
    const pool = require('../../config/database');
    const r = await pool.query('DELETE FROM provider_holidays WHERE id=$1 AND provider_id=$2 RETURNING id', [req.params.holidayId, req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Holiday not found' });
    res.json({ success: true, message: 'Holiday deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
