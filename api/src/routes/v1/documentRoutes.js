const express = require('express');
const router = express.Router();
const DocumentController = require('../../controllers/documentController');
const { AuthMiddleware } = require('../../middleware/auth');
const { uploadDocuments } = require('../../utils/documentUpload');

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create documents with file uploads (supports multiple items per request)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [patient_id, items, files]
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *                 description: Patient UUID
 *                 example: "6a8d2d1d-86fc-4dd8-98a0-b73f7855e153"
 *               provider_id:
 *                 type: string
 *                 format: uuid
 *                 description: Provider UUID (optional)
 *               items:
 *                 type: string
 *                 description: |
 *                   JSON array of document metadata. One entry per file uploaded.
 *                   Each item maps by index to the corresponding file in `files`.
 *                 example: '[{"name":"Lab Report 21-04-2026","document_type":"Lab Report","upload_date":"2026-04-21"},{"name":"X-Ray 21-04-2026","document_type":"X-Ray","upload_date":"2026-04-21"}]'
 *               files:
 *                 type: array
 *                 description: Files to upload — one per item entry (PDF or image, max 10MB each)
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Documents created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Document created successfully" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     patient_id: { type: string, format: uuid }
 *                     upload_date: { type: string, format: date-time }
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: string, format: uuid }
 *                           name: { type: string, example: "Lab Report 21-04-2026" }
 *                           document_type: { type: string, example: "Lab Report" }
 *                           upload_date: { type: string, format: date }
 *                           file_path: { type: string, example: "http://localhost:8080/uploads/documents/2026/04/21/file.pdf" }
 *                           file_originalname: { type: string, example: "report.pdf" }
 *                           file_mimetype: { type: string, example: "application/pdf" }
 *                           file_size: { type: integer, example: 204800 }
 *       400:
 *         description: patient_id or items missing
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
/**
 * @swagger
 * /documents/{id}:
 *   put:
 *     summary: Update document items and files
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [patient_id, items]
 *             properties:
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: string
 *                 description: |
 *                   JSON array of document metadata. Include `id` for existing items.
 *                   One entry per file slot (pass empty Blob for unchanged files).
 *                 example: '[{"id":"uuid","name":"Lab Report","document_type":"Lab Report","upload_date":"2026-04-21"}]'
 *               files:
 *                 type: array
 *                 description: Files — one per item. Send empty Blob to keep existing file.
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Document updated successfully
 */
router.put('/:id', AuthMiddleware.authenticate, uploadDocuments, DocumentController.update);

/**
 * @swagger
 * /documents/items/{itemId}:
 *   delete:
 *     summary: Delete a single document item and its file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the document_items row to delete
 *     responses:
 *       200:
 *         description: Document item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Document item deleted successfully" }
 *                 deleted_item:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     document_id: { type: string, format: uuid }
 *                     name: { type: string }
 *                     document_type: { type: string }
 *                     file_path: { type: string }
 *                     file_originalname: { type: string }
 *                     file_size: { type: integer }
 *       404:
 *         description: Document item not found
 */
router.delete('/items/:itemId', AuthMiddleware.authenticate, DocumentController.deleteItem);

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

module.exports = router;
