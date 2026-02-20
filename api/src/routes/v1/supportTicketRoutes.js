const express = require('express');
const router = express.Router();
const SupportTicketController = require('../../controllers/supportTicketController');
const TicketReplyController = require('../../controllers/ticketReplyController');
const { authenticate } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/support-tickets:
 *   get:
 *     summary: Get all support tickets
 *     tags: [Support Tickets]
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, In Progress, Closed]
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
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
 *         description: List of support tickets
 */
router.get('/', SupportTicketController.getAllTickets);

/**
 * @swagger
 * /api/v1/support-tickets/{id}:
 *   get:
 *     summary: Get support ticket by ID
 *     tags: [Support Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Support ticket details
 *       404:
 *         description: Support ticket not found
 */
router.get('/:id', SupportTicketController.getTicketById);

/**
 * @swagger
 * /api/v1/support-tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Support Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - subject
 *               - description
 *             properties:
 *               patient_id:
 *                 type: string
 *               provider_id:
 *                 type: string
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Open, In Progress, Closed]
 *     responses:
 *       201:
 *         description: Support ticket created successfully
 */
router.post('/', SupportTicketController.createTicket);

/**
 * @swagger
 * /api/v1/support-tickets/{id}:
 *   put:
 *     summary: Update support ticket
 *     tags: [Support Tickets]
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
 *         description: Support ticket updated successfully
 *       404:
 *         description: Support ticket not found
 */
router.put('/:id', SupportTicketController.updateTicket);

/**
 * @swagger
 * /api/v1/support-tickets/{id}:
 *   delete:
 *     summary: Delete support ticket
 *     tags: [Support Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Support ticket deleted successfully
 *       404:
 *         description: Support ticket not found
 */
router.delete('/:id', SupportTicketController.deleteTicket);

// Ticket Replies Routes
router.get('/:ticket_id/replies', TicketReplyController.getRepliesByTicket);
router.post('/:ticket_id/replies', TicketReplyController.createReply);
router.put('/replies/:id', TicketReplyController.updateReply);
router.delete('/replies/:id', TicketReplyController.deleteReply);

module.exports = router;
