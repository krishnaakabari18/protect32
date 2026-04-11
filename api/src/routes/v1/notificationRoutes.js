const express = require('express');
const router = express.Router();
const NotificationController = require('../../controllers/notificationController');
const { AuthMiddleware } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Send and manage notifications for patients and providers
 */

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Send notification with flexible targeting
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Send a notification to patients or providers with three targeting modes:
 *       - **all** – Send to every patient/provider
 *       - **selected** – Send only to specified IDs
 *       - **exclude** – Send to all except specified IDs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - target_audience
 *               - target_type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Appointment Reminder"
 *               message:
 *                 type: string
 *                 example: "Your appointment is tomorrow at 10:00 AM"
 *               notification_type:
 *                 type: string
 *                 enum: [appointment, payment, reminder, system, alert]
 *                 default: system
 *               target_audience:
 *                 type: string
 *                 enum: [patient, provider]
 *                 example: patient
 *               target_type:
 *                 type: string
 *                 enum: [all, selected, exclude]
 *                 example: all
 *               selected_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Required when target_type is "selected" or "exclude"
 *               exclude_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Required when target_type is "exclude"
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification sent to 5 patient(s)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sent_count:
 *                       type: integer
 *                     recipients:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Validation error
 */
router.post('/send', AuthMiddleware.authenticate, NotificationController.send);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: notification_type
 *         schema:
 *           type: string
 *           enum: [appointment, payment, reminder, system, alert]
 *       - in: query
 *         name: target_audience
 *         schema:
 *           type: string
 *           enum: [patient, provider]
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
 *         description: List of notifications
 */
router.get('/', AuthMiddleware.authenticate, NotificationController.getAll);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
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
 *         description: Notification details
 *       404:
 *         description: Notification not found
 */
router.get('/:id', AuthMiddleware.authenticate, NotificationController.getById);

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Update notification
 *     tags: [Notifications]
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
 *         description: Notification updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, NotificationController.update);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
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
 *         description: Notification deleted successfully
 */
router.delete('/:id', AuthMiddleware.authenticate, NotificationController.delete);

module.exports = router;
