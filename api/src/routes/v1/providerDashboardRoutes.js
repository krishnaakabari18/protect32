const express = require('express');
const router = express.Router();
const { AuthMiddleware } = require('../../middleware/auth');
const pool = require('../../config/database');

const auth = AuthMiddleware.authenticate;

/**
 * @swagger
 * tags:
 *   name: Provider Dashboard
 *   description: Provider-specific dashboard APIs
 */

// ─── Helper ──────────────────────────────────────────────────────────────────
const getProviderId = async (userId) => {
  const r = await pool.query('SELECT id FROM providers WHERE id = $1', [userId]);
  return r.rows[0]?.id || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /provider-dashboard/summary
// Stats: appointments today, new messages, patient requests, follow-up requests
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /provider-dashboard/summary:
 *   get:
 *     summary: Provider dashboard summary stats
 *     tags: [Provider Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointments_today:  { type: integer }
 *                     new_messages:        { type: integer }
 *                     patient_requests:    { type: integer }
 *                     follow_up_requests:  { type: integer }
 *                     provider_name:       { type: string }
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, error: 'Provider not found' });

    const today = new Date().toISOString().split('T')[0];

    const [apptToday, newMessages, patientRequests, followUp, providerRow] = await Promise.all([
      // Appointments today
      pool.query(
        `SELECT COUNT(*) FROM appointments WHERE provider_id = $1 AND appointment_date = $2`,
        [providerId, today]
      ),
      // New/unread messages (chats)
      pool.query(
        `SELECT COUNT(*) FROM chats WHERE receiver_id = $1 AND is_read = false`,
        [req.user.id]
      ).catch(() => ({ rows: [{ count: 0 }] })),
      // Patient requests (upcoming appointments not yet confirmed)
      pool.query(
        `SELECT COUNT(*) FROM appointments WHERE provider_id = $1 AND status = 'Upcoming' AND appointment_date >= $2`,
        [providerId, today]
      ),
      // Follow-up requests (completed appointments in last 7 days)
      pool.query(
        `SELECT COUNT(*) FROM appointments WHERE provider_id = $1 AND status = 'Completed'
         AND appointment_date >= $2::date - INTERVAL '7 days'`,
        [providerId, today]
      ),
      // Provider name
      pool.query(
        `SELECT u.first_name, u.last_name FROM users u WHERE u.id = $1`,
        [req.user.id]
      ),
    ]);

    const p = providerRow.rows[0] || {};
    res.json({
      success: true,
      data: {
        provider_name: `Dr. ${p.first_name || ''} ${p.last_name || ''}`.trim(),
        appointments_today: parseInt(apptToday.rows[0].count),
        new_messages:       parseInt(newMessages.rows[0].count),
        patient_requests:   parseInt(patientRequests.rows[0].count),
        follow_up_requests: parseInt(followUp.rows[0].count),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /provider-dashboard/earnings
// Today / This week / Last week earnings
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /provider-dashboard/earnings:
 *   get:
 *     summary: Provider earnings summary
 *     tags: [Provider Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     today:     { type: number }
 *                     this_week: { type: number }
 *                     last_week: { type: number }
 */
router.get('/earnings', auth, async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, error: 'Provider not found' });

    const [todayRow, thisWeekRow, lastWeekRow] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(p.amount), 0) as total
         FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         WHERE a.provider_id = $1 AND p.payment_status = 'Paid'
           AND DATE(p.payment_date) = CURRENT_DATE`,
        [providerId]
      ),
      pool.query(
        `SELECT COALESCE(SUM(p.amount), 0) as total
         FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         WHERE a.provider_id = $1 AND p.payment_status = 'Paid'
           AND p.payment_date >= DATE_TRUNC('week', CURRENT_DATE)`,
        [providerId]
      ),
      pool.query(
        `SELECT COALESCE(SUM(p.amount), 0) as total
         FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         WHERE a.provider_id = $1 AND p.payment_status = 'Paid'
           AND p.payment_date >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
           AND p.payment_date < DATE_TRUNC('week', CURRENT_DATE)`,
        [providerId]
      ),
    ]);

    res.json({
      success: true,
      data: {
        today:     parseFloat(todayRow.rows[0].total),
        this_week: parseFloat(thisWeekRow.rows[0].total),
        last_week: parseFloat(lastWeekRow.rows[0].total),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /provider-dashboard/weekly-volume
// Daily appointment count for current week (Mon–Sun)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /provider-dashboard/weekly-volume:
 *   get:
 *     summary: Weekly patient volume (appointments per day this week)
 *     tags: [Provider Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly volume data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_orders: { type: integer }
 *                     days:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           day:   { type: string }
 *                           date:  { type: string }
 *                           count: { type: integer }
 */
router.get('/weekly-volume', auth, async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, error: 'Provider not found' });

    const r = await pool.query(
      `SELECT
         TO_CHAR(appointment_date, 'Dy') as day,
         TO_CHAR(appointment_date, 'YYYY-MM-DD') as date,
         COUNT(*) as count
       FROM appointments
       WHERE provider_id = $1
         AND appointment_date >= DATE_TRUNC('week', CURRENT_DATE)
         AND appointment_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
       GROUP BY appointment_date
       ORDER BY appointment_date`,
      [providerId]
    );

    // Fill all 7 days even if no appointments
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const filled = days.map((day, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = r.rows.find(row => row.date === dateStr);
      return { day, date: dateStr, count: found ? parseInt(found.count) : 0 };
    });

    const totalOrders = filled.reduce((s, d) => s + d.count, 0);

    res.json({ success: true, data: { total_orders: totalOrders, days: filled } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /provider-dashboard/ratings
// Average rating + breakdown by star level
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /provider-dashboard/ratings:
 *   get:
 *     summary: Provider ratings summary
 *     tags: [Provider Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ratings data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     average:      { type: number }
 *                     total_reviews:{ type: integer }
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         excellent:     { type: integer, description: "5 stars" }
 *                         good:          { type: integer, description: "4 stars" }
 *                         average:       { type: integer, description: "3 stars" }
 *                         below_average: { type: integer, description: "2 stars" }
 *                         poor:          { type: integer, description: "1 star" }
 */
router.get('/ratings', auth, async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, error: 'Provider not found' });

    const r = await pool.query(
      `SELECT
         ROUND(AVG(rating)::numeric, 1) as average,
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE rating = 5) as excellent,
         COUNT(*) FILTER (WHERE rating = 4) as good,
         COUNT(*) FILTER (WHERE rating = 3) as average_count,
         COUNT(*) FILTER (WHERE rating = 2) as below_average,
         COUNT(*) FILTER (WHERE rating = 1) as poor
       FROM provider_reviews
       WHERE provider_id = $1`,
      [providerId]
    );

    const row = r.rows[0];
    const total = parseInt(row.total) || 0;

    res.json({
      success: true,
      data: {
        average:       parseFloat(row.average) || 0,
        total_reviews: total,
        breakdown: {
          excellent:     parseInt(row.excellent),
          good:          parseInt(row.good),
          average:       parseInt(row.average_count),
          below_average: parseInt(row.below_average),
          poor:          parseInt(row.poor),
          // Percentages for progress bars
          excellent_pct:     total > 0 ? Math.round(row.excellent / total * 100) : 0,
          good_pct:          total > 0 ? Math.round(row.good / total * 100) : 0,
          average_pct:       total > 0 ? Math.round(row.average_count / total * 100) : 0,
          below_average_pct: total > 0 ? Math.round(row.below_average / total * 100) : 0,
          poor_pct:          total > 0 ? Math.round(row.poor / total * 100) : 0,
        },
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /provider-dashboard/today-schedule
// Today's appointments with patient info and time
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /provider-dashboard/today-schedule:
 *   get:
 *     summary: Today's appointment schedule for the provider
 *     tags: [Provider Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's schedule
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:              { type: string }
 *                       patient_name:    { type: string }
 *                       patient_photo:   { type: string }
 *                       service:         { type: string }
 *                       start_time:      { type: string }
 *                       end_time:        { type: string }
 *                       status:          { type: string }
 *                       appointment_code:{ type: string }
 */
router.get('/today-schedule', auth, async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, error: 'Provider not found' });

    const today = new Date().toISOString().split('T')[0];
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';

    const r = await pool.query(
      `SELECT
         a.id, a.appointment_code, a.service, a.status,
         TO_CHAR(a.start_time, 'HH12:MI AM') as start_time,
         TO_CHAR(a.end_time,   'HH12:MI AM') as end_time,
         u.first_name || ' ' || u.last_name as patient_name,
         COALESCE(pat.profile_photo, u.profile_picture) as patient_photo
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       LEFT JOIN patients pat ON a.patient_id = pat.id
       WHERE a.provider_id = $1
         AND a.appointment_date = $2
       ORDER BY a.start_time ASC`,
      [providerId, today]
    );

    const data = r.rows.map(row => ({
      ...row,
      patient_photo: row.patient_photo
        ? (row.patient_photo.startsWith('http') ? row.patient_photo : `${baseUrl}/${row.patient_photo}`)
        : null,
    }));

    res.json({ success: true, data, total: data.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
