const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middleware/auth'); const authenticate = AuthMiddleware.authenticate;
const pool = require('../../config/database');

/**
 * @swagger
 * tags:
 *   name: Dropdowns
 *   description: Centralized dropdown data for all select fields
 */

/**
 * @swagger
 * /dropdowns/{type}:
 *   get:
 *     summary: Get dropdown options for a specific type
 *     tags: [Dropdowns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [patients, providers, procedures, plans, users, specialties, states, cities, document-types, ticket-types, notification-types, blood-groups, genders, marital-statuses, insurance-types]
 *         description: Type of dropdown data to fetch
 *       - in: query
 *         name: parent_id
 *         schema:
 *           type: string
 *         description: Parent ID for dependent dropdowns (e.g., state_id for cities)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter options by search term
 *     responses:
 *       200:
 *         description: Dropdown options
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
 *                       value:
 *                         type: string
 *                       label:
 *                         type: string
 *                       meta:
 *                         type: object
 *                         description: Extra data (email, category, etc.)
 */
router.get('/:type', authenticate, async (req, res) => {
  try {
    const { type } = req.params;
    const { parent_id, search } = req.query;
    const searchLike = search ? `%${search}%` : null;

    let data = [];

    switch (type) {
      case 'provider-procedures': {
        // Returns procedures assigned to a provider with their fee from provider_procedures
        if (!parent_id) { data = []; break; }
        const r = await pool.query(
          `SELECT pr.id as value, pr.name as label,
             pp.price as meta_price,
             pr.category as meta_category
           FROM provider_procedures pp
           JOIN procedures pr ON pp.procedure_id = pr.id
           WHERE pp.provider_id = $1 AND pr.is_active = true
           ORDER BY pr.name`,
          [parent_id]
        );
        data = r.rows.map(row => ({
          value: row.value,
          label: row.label,
          meta: { price: row.meta_price, category: row.meta_category }
        }));
        break;
      }

      case 'patient-appointments': {
        if (!parent_id) { data = []; break; }
        const q = searchLike
          ? `SELECT a.id as value, a.appointment_code as label,
               TO_CHAR(a.appointment_date,'DD/MM/YYYY') as meta_date,
               a.service as meta_service, a.status as meta_status
             FROM appointments a
             WHERE a.patient_id = $1 AND (a.appointment_code ILIKE $2 OR a.service ILIKE $2)
             ORDER BY a.appointment_date DESC LIMIT 200`
          : `SELECT a.id as value, a.appointment_code as label,
               TO_CHAR(a.appointment_date,'DD/MM/YYYY') as meta_date,
               a.service as meta_service, a.status as meta_status
             FROM appointments a
             WHERE a.patient_id = $1
             ORDER BY a.appointment_date DESC LIMIT 200`;
        const r = await pool.query(q, searchLike ? [parent_id, searchLike] : [parent_id]);
        data = r.rows.map(row => ({
          value: row.value,
          label: row.label,
          meta: { date: row.meta_date, service: row.meta_service, status: row.meta_status }
        }));
        break;
      }

      case 'patients': {
        const q = searchLike
          ? `SELECT p.id as value, CONCAT(u.first_name,' ',u.last_name) as label, u.email as meta_email, u.mobile_number as meta_phone
             FROM patients p JOIN users u ON p.id=u.id
             WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1
             ORDER BY u.first_name LIMIT 200`
          : `SELECT p.id as value, CONCAT(u.first_name,' ',u.last_name) as label, u.email as meta_email, u.mobile_number as meta_phone
             FROM patients p JOIN users u ON p.id=u.id ORDER BY u.first_name LIMIT 200`;
        const r = await pool.query(q, searchLike ? [searchLike] : []);
        data = r.rows.map(row => ({ value: row.value, label: row.label, meta: { email: row.meta_email, phone: row.meta_phone } }));
        break;
      }

      case 'providers': {
        const q = searchLike
          ? `SELECT p.id as value,
               COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'')||' '||COALESCE(u.last_name,'')), ''), p.full_name, p.clinic_name) as label,
               u.email as meta_email, p.specialty as meta_specialty
             FROM providers p LEFT JOIN users u ON p.id=u.id
             WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR p.full_name ILIKE $1 OR p.specialty ILIKE $1
             ORDER BY label LIMIT 200`
          : `SELECT p.id as value,
               COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'')||' '||COALESCE(u.last_name,'')), ''), p.full_name, p.clinic_name) as label,
               u.email as meta_email, p.specialty as meta_specialty
             FROM providers p LEFT JOIN users u ON p.id=u.id ORDER BY label LIMIT 200`;
        const r = await pool.query(q, searchLike ? [searchLike] : []);
        data = r.rows.map(row => ({ value: row.value, label: row.label, meta: { email: row.meta_email, specialty: row.meta_specialty } }));
        break;
      }

      case 'procedures': {
        const q = searchLike
          ? `SELECT id as value, name as label, category as meta_category FROM procedures WHERE is_active=true AND (name ILIKE $1 OR category ILIKE $1) ORDER BY name LIMIT 200`
          : `SELECT id as value, name as label, category as meta_category FROM procedures WHERE is_active=true ORDER BY name LIMIT 200`;
        const r = await pool.query(q, searchLike ? [searchLike] : []);
        data = r.rows.map(row => ({ value: row.value, label: row.label, meta: { category: row.meta_category } }));
        break;
      }

      case 'plans': {
        const r = await pool.query(`SELECT id as value, name as label, price as meta_price FROM plans WHERE is_active=true ORDER BY name`);
        data = r.rows.map(row => ({ value: row.value, label: row.label, meta: { price: row.meta_price } }));
        break;
      }

      case 'users': {
        const q = searchLike
          ? `SELECT id as value, CONCAT(first_name,' ',last_name) as label, email as meta_email, user_type as meta_type FROM users WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 ORDER BY first_name LIMIT 200`
          : `SELECT id as value, CONCAT(first_name,' ',last_name) as label, email as meta_email, user_type as meta_type FROM users ORDER BY first_name LIMIT 200`;
        const r = await pool.query(q, searchLike ? [searchLike] : []);
        data = r.rows.map(row => ({ value: row.value, label: `${row.label} (${row.meta_email})`, meta: { email: row.meta_email, type: row.meta_type } }));
        break;
      }

      case 'specialties': {
        const r = await pool.query(`SELECT DISTINCT specialty as value, specialty as label FROM providers WHERE specialty IS NOT NULL AND specialty != '' ORDER BY specialty`);
        data = r.rows;
        break;
      }

      case 'states': {
        const r = await pool.query(`SELECT id::text as value, name as label FROM states_cities WHERE type='state' AND is_active=true ORDER BY name`);
        data = r.rows;
        break;
      }

      case 'cities': {
        if (!parent_id) { data = []; break; }
        const r = await pool.query(`SELECT id::text as value, name as label FROM states_cities WHERE type='city' AND parent_id=$1 AND is_active=true ORDER BY name`, [parent_id]);
        data = r.rows;
        break;
      }

      // Static dropdowns
      case 'document-types':
        data = ['Medical Record','X-Ray','Lab Report','Prescription','Insurance','Treatment Plan','Consent Form','Other']
          .map(v => ({ value: v, label: v }));
        break;

      case 'ticket-types':
        data = ['Query','Technical Support','Refund Payment'].map(v => ({ value: v, label: v }));
        break;

      case 'notification-types':
        data = ['appointment','payment','reminder','system','alert'].map(v => ({ value: v, label: v.charAt(0).toUpperCase()+v.slice(1) }));
        break;

      case 'blood-groups':
        data = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ value: v, label: v }));
        break;

      case 'genders':
        data = ['Male','Female','Other','Prefer not to say'].map(v => ({ value: v, label: v }));
        break;

      case 'marital-statuses':
        data = ['Single','Married','Divorced','Widowed','Separated'].map(v => ({ value: v, label: v }));
        break;

      case 'insurance-types':
        data = ['Individual','Family','Group','Government'].map(v => ({ value: v, label: v }));
        break;

      default:
        return res.status(400).json({ error: `Unknown dropdown type: ${type}` });
    }

    res.json({ data, total: data.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
