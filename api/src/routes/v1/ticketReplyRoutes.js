const express = require('express');
const router = express.Router();
const TicketReplyController = require('../../controllers/ticketReplyController');
const { authenticate } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/support-tickets/{ticket_id}/replies:
 *   get:
 *     summary: Get all replies for a ticket
 *     tags: [Ticket Replies]
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of replies
 *       404:
 *         description: Ticket not found
 */
router.get('/:ticket_id/replies', TicketReplyController.getRepliesByTicket);

/**
 * @swagger
 * /api/v1/support-tickets/{ticket_id}/replies:
 *   post:
 *     summary: Add a reply to a ticket
 *     tags: [Ticket Replies]
 *     parameters:
 *       - in: path
 *         name: ticket_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       400:
 *         description: Cannot reply to closed ticket
 *       404:
 *         description: Ticket not found
 */
router.post('/:ticket_id/replies', TicketReplyController.createReply);

/**
 * @swagger
 * /api/v1/ticket-replies/{id}:
 *   put:
 *     summary: Update a reply
 *     tags: [Ticket Replies]
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
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       403:
 *         description: Can only edit own replies
 *       404:
 *         description: Reply not found
 */
router.put('/replies/:id', TicketReplyController.updateReply);

/**
 * @swagger
 * /api/v1/ticket-replies/{id}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Ticket Replies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reply deleted successfully
 *       403:
 *         description: Can only delete own replies
 *       404:
 *         description: Reply not found
 */
router.delete('/replies/:id', TicketReplyController.deleteReply);

module.exports = router;
