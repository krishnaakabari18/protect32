const express = require('express');
const router = express.Router();
const StatesCitiesController = require('../../controllers/statesCitiesController');
const { authenticate } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: States & Cities
 *   description: Indian states and cities lookup
 */

/**
 * @swagger
 * /states-cities/states:
 *   get:
 *     summary: Get all states
 *     tags: [States & Cities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all states
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
 *                         type: integer
 *                       name:
 *                         type: string
 *                         example: Maharashtra
 *                 total:
 *                   type: integer
 */
router.get('/states', authenticate, StatesCitiesController.getStates);

/**
 * @swagger
 * /states-cities/states/{stateId}/cities:
 *   get:
 *     summary: Get cities by state ID
 *     tags: [States & Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: State ID
 *     responses:
 *       200:
 *         description: List of cities for the given state
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
 *                         type: integer
 *                       name:
 *                         type: string
 *                         example: Mumbai
 */
router.get('/states/:stateId/cities', authenticate, StatesCitiesController.getCitiesByState);

/**
 * @swagger
 * /states-cities/cities:
 *   get:
 *     summary: Get all cities (optionally search by name)
 *     tags: [States & Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search city by name (returns max 20 results)
 *     responses:
 *       200:
 *         description: List of cities with state name
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
 *                         type: integer
 *                       name:
 *                         type: string
 *                       parent_id:
 *                         type: integer
 *                       state_name:
 *                         type: string
 */
router.get('/cities', authenticate, StatesCitiesController.getAllCities);

/**
 * @swagger
 * /states-cities/states:
 *   post:
 *     summary: Add a new state
 *     tags: [States & Cities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: New State
 *     responses:
 *       201:
 *         description: State created successfully
 */
router.post('/states', authenticate, StatesCitiesController.createState);

/**
 * @swagger
 * /states-cities/states/{stateId}/cities:
 *   post:
 *     summary: Add a new city to a state
 *     tags: [States & Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: New City
 *     responses:
 *       201:
 *         description: City created successfully
 */
router.post('/states/:stateId/cities', authenticate, StatesCitiesController.createCity);

/**
 * @swagger
 * /states-cities/{id}:
 *   put:
 *     summary: Update a state or city
 *     tags: [States & Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/:id', authenticate, StatesCitiesController.update);

/**
 * @swagger
 * /states-cities/{id}:
 *   delete:
 *     summary: Delete a state or city
 *     tags: [States & Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/:id', authenticate, StatesCitiesController.delete);

module.exports = router;
