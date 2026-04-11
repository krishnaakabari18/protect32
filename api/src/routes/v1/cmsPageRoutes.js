const express = require('express');
const router = express.Router();
const CmsPageController = require('../../controllers/cmsPageController');
const { AuthMiddleware } = require('../../middleware/auth'); const authenticate = AuthMiddleware.authenticate;

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: CMS Pages
 *   description: Manage CMS pages (Published/Draft)
 */

/**
 * @swagger
 * /cms-pages:
 *   get:
 *     summary: Get all CMS pages
 *     tags: [CMS Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Published, Draft]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *         description: List of CMS pages
 */
router.get('/', CmsPageController.getAll);

/**
 * @swagger
 * /cms-pages/{id}:
 *   get:
 *     summary: Get CMS page by ID
 *     tags: [CMS Pages]
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
 *         description: CMS page details
 *       404:
 *         description: CMS page not found
 */
router.get('/:id', CmsPageController.getById);

/**
 * @swagger
 * /cms-pages:
 *   post:
 *     summary: Create a new CMS page
 *     tags: [CMS Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *                 description: Auto-generated from title if blank
 *               content:
 *                 type: string
 *               meta_title:
 *                 type: string
 *               meta_description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Published, Draft]
 *                 default: Draft
 *     responses:
 *       201:
 *         description: CMS page created successfully
 *       400:
 *         description: Title is required or slug already exists
 */
router.post('/', CmsPageController.create);

/**
 * @swagger
 * /cms-pages/{id}:
 *   put:
 *     summary: Update a CMS page
 *     tags: [CMS Pages]
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
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               meta_title:
 *                 type: string
 *               meta_description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Published, Draft]
 *     responses:
 *       200:
 *         description: CMS page updated successfully
 *       404:
 *         description: CMS page not found
 */
router.put('/:id', CmsPageController.update);

/**
 * @swagger
 * /cms-pages/{id}/status:
 *   patch:
 *     summary: Toggle CMS page status (Published/Draft)
 *     tags: [CMS Pages]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Published, Draft]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: CMS page not found
 */
router.patch('/:id/status', CmsPageController.updateStatus);

/**
 * @swagger
 * /cms-pages/{id}:
 *   delete:
 *     summary: Delete a CMS page
 *     tags: [CMS Pages]
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
 *         description: CMS page deleted successfully
 *       404:
 *         description: CMS page not found
 */
router.delete('/:id', CmsPageController.delete);

module.exports = router;
