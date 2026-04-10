const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const InquiryModel = require('../../models/inquiryModel');

/**
 * @swagger
 * tags:
 *   name: Inquiries
 *   description: Inquiry management
 */

/**
 * @swagger
 * /inquiries:
 *   post:
 *     summary: Submit a new inquiry (public)
 *     tags: [Inquiries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, message]
 *             properties:
 *               name:    { type: string }
 *               email:   { type: string }
 *               phone:   { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 *               source:  { type: string }
 *     responses:
 *       201: { description: Inquiry submitted }
 *       400: { description: Validation error }
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'name, email, phone, message are required' });
    }
    const data = await InquiryModel.create(req.body);
    res.status(201).json({ message: 'Inquiry submitted successfully', data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /inquiries:
 *   get:
 *     summary: Get all inquiries with filters and pagination
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [new, in_progress, completed, rejected] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name, email, phone, subject
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: is_read
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of inquiries }
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows, total } = await InquiryModel.findAll(req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    res.json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /inquiries/export:
 *   get:
 *     summary: Export inquiries as CSV
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/export', authenticate, async (req, res) => {
  try {
    const rows = await InquiryModel.exportAll(req.query);
    const headers = ['ID','Name','Email','Phone','Subject','Message','Source','Status','Read','Notes','Created At'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.id, `"${(r.name||'').replace(/"/g,'""')}"`,
        `"${(r.email||'').replace(/"/g,'""')}"`,
        `"${(r.phone||'').replace(/"/g,'""')}"`,
        `"${(r.subject||'').replace(/"/g,'""')}"`,
        `"${(r.message||'').replace(/"/g,'""')}"`,
        r.source || '', r.status,
        r.is_read ? 'Yes' : 'No',
        `"${(r.notes||'').replace(/"/g,'""')}"`,
        r.created_at ? new Date(r.created_at).toLocaleString() : ''
      ].join(','))
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inquiries-${Date.now()}.csv"`);
    res.send(csv);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /inquiries/bulk-delete:
 *   post:
 *     summary: Bulk delete inquiries
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200: { description: Deleted successfully }
 */
router.post('/bulk-delete', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'ids array is required' });
    const deleted = await InquiryModel.bulkDelete(ids);
    res.json({ message: `${deleted.length} inquiries deleted`, deleted });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /inquiries/bulk-status:
 *   post:
 *     summary: Bulk update inquiry status
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids, status]
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: string }
 *               status:
 *                 type: string
 *                 enum: [new, in_progress, completed, rejected]
 *     responses:
 *       200: { description: Status updated }
 */
router.post('/bulk-status', authenticate, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids?.length || !status) return res.status(400).json({ error: 'ids and status are required' });
    const updated = await InquiryModel.bulkUpdateStatus(ids, status);
    res.json({ message: `${updated.length} inquiries updated`, updated });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /inquiries/{id}:
 *   get:
 *     summary: Get inquiry by ID
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Inquiry details }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const data = await InquiryModel.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Inquiry not found' });
    // Auto mark as read on view
    if (!data.is_read) await InquiryModel.update(req.params.id, { is_read: true });
    res.json({ data: { ...data, is_read: true } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /inquiries/{id}:
 *   put:
 *     summary: Update inquiry status / notes
 *     tags: [Inquiries]
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
 *             properties:
 *               status:  { type: string, enum: [new, in_progress, completed, rejected] }
 *               notes:   { type: string }
 *               is_read: { type: boolean }
 *     responses:
 *       200: { description: Updated }
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const data = await InquiryModel.update(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ message: 'Inquiry updated successfully', data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * @swagger
 * /inquiries/{id}:
 *   delete:
 *     summary: Delete inquiry
 *     tags: [Inquiries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const data = await InquiryModel.delete(req.params.id);
    if (!data) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
