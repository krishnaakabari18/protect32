const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/dashboardController');
const { AuthMiddleware } = require('../../middleware/auth'); const authenticate = AuthMiddleware.authenticate;

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and analytics
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get complete dashboard data
 *     description: Retrieve all dashboard statistics, charts, and recent data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total_appointments:
 *                           type: integer
 *                           example: 150
 *                         pending_appointments:
 *                           type: integer
 *                           example: 25
 *                         completed_appointments:
 *                           type: integer
 *                           example: 100
 *                         total_patients:
 *                           type: integer
 *                           example: 75
 *                         new_patients_this_month:
 *                           type: integer
 *                           example: 10
 *                         total_payments:
 *                           type: integer
 *                           example: 120
 *                         pending_payments:
 *                           type: integer
 *                           example: 15
 *                         total_revenue:
 *                           type: number
 *                           example: 50000.00
 *                         pending_revenue:
 *                           type: number
 *                           example: 5000.00
 *                     charts:
 *                       type: object
 *                       properties:
 *                         monthlyAppointments:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: string
 *                                 example: "Jan"
 *                               count:
 *                                 type: integer
 *                                 example: 15
 *                         monthlyRevenue:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: string
 *                                 example: "Jan"
 *                               total:
 *                                 type: number
 *                                 example: 5000.00
 *                     recent:
 *                       type: object
 *                       properties:
 *                         appointments:
 *                           type: array
 *                           items:
 *                             type: object
 *                         patients:
 *                           type: array
 *                           items:
 *                             type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, dashboardController.getDashboard);

/**
 * @swagger
 * /dashboard/statistics:
 *   get:
 *     summary: Get dashboard statistics only
 *     description: Retrieve only the statistics without charts and recent data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/statistics', authenticate, dashboardController.getStatistics);

module.exports = router;
