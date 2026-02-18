const express = require('express');
const router = express.Router();
const AppointmentController = require('../../controllers/appointmentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patient_id:
 *           type: string
 *           format: uuid
 *         provider_id:
 *           type: string
 *           format: uuid
 *         appointment_date:
 *           type: string
 *           format: date
 *         start_time:
 *           type: string
 *           format: time
 *         end_time:
 *           type: string
 *           format: time
 *         service:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Upcoming, Completed, Cancelled, No-Show]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - provider_id
 *               - appointment_date
 *               - start_time
 *               - end_time
 *               - service
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               provider_id:
 *                 type: string
 *                 format: uuid
 *               operatory_id:
 *                 type: string
 *                 format: uuid
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               service:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
router.post('/', AppointmentController.createAppointment);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by patient ID
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by provider ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Upcoming, Completed, Cancelled, No-Show]
 *         description: Filter by status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 */
router.get('/', AppointmentController.getAllAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', AppointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
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
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               service:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Completed, Cancelled, No-Show]
 *               notes:
 *                 type: string
 *               cancellation_reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         description: Appointment not found
 */
router.put('/:id', AppointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', AppointmentController.deleteAppointment);

module.exports = router;
