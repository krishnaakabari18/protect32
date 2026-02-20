const express = require('express');
const router = express.Router();
const DocumentController = require('../../controllers/documentController');
const AuthMiddleware = require('../../middleware/auth');
const { uploadDocuments } = require('../../utils/documentUpload');

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create a new document with file uploads
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               patient_id:
 *                 type: string
 *               provider_id:
 *                 type: string
 *               name:
 *                 type: string
 *               document_type:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document created successfully
 */
router.post('/', AuthMiddleware.authenticate, uploadDocuments, DocumentController.create);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: document_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', AuthMiddleware.authenticate, DocumentController.getAll);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
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
 *         description: Document details
 */
router.get('/:id', AuthMiddleware.authenticate, DocumentController.getById);

/**
 * @swagger
 * /documents/{id}:
 *   put:
 *     summary: Update document
 *     tags: [Documents]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               patient_id:
 *                 type: string
 *               provider_id:
 *                 type: string
 *               name:
 *                 type: string
 *               document_type:
 *                 type: string
 *               notes:
 *                 type: string
 *               keep_existing_files:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Document updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, uploadDocuments, DocumentController.update);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete document and all associated files
 *     tags: [Documents]
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
 *         description: Document deleted successfully
 */
router.delete('/:id', AuthMiddleware.authenticate, DocumentController.delete);

/**
 * @swagger
 * /documents/{id}/files/{fileIndex}:
 *   delete:
 *     summary: Delete a specific file from a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fileIndex
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete('/:id/files/:fileIndex', AuthMiddleware.authenticate, DocumentController.deleteFile);

module.exports = router;
