const ProcedureModel = require('../models/procedureModel');

class ProcedureController {
  /**
   * @swagger
   * /procedures:
   *   get:
   *     summary: Get all procedures
   *     tags: [Procedures]
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: is_active
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in procedure names
   *     responses:
   *       200:
   *         description: List of procedures
   */
  static async getAll(req, res) {
    try {
      const { category, is_active, search } = req.query;
      const filters = {};
      
      if (category) filters.category = category;
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (search) filters.search = search;

      const procedures = await ProcedureModel.findAll(filters);
      
      res.json({ 
        success: true,
        data: procedures,
        count: procedures.length
      });
    } catch (error) {
      console.error('Get procedures error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /procedures/by-category:
   *   get:
   *     summary: Get procedures grouped by category
   *     tags: [Procedures]
   *     responses:
   *       200:
   *         description: Procedures grouped by category
   */
  static async getByCategory(req, res) {
    try {
      const data = await ProcedureModel.findByCategory();
      
      res.json({ 
        success: true,
        data: data
      });
    } catch (error) {
      console.error('Get procedures by category error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /procedures/categories:
   *   get:
   *     summary: Get all procedure categories
   *     tags: [Procedures]
   *     responses:
   *       200:
   *         description: List of categories with counts
   */
  static async getCategories(req, res) {
    try {
      const categories = await ProcedureModel.getCategories();
      
      res.json({ 
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /procedures/{id}:
   *   get:
   *     summary: Get procedure by ID
   *     tags: [Procedures]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Procedure details
   *       404:
   *         description: Procedure not found
   */
  static async getById(req, res) {
    try {
      const procedure = await ProcedureModel.findById(req.params.id);
      
      if (!procedure) {
        return res.status(404).json({ error: 'Procedure not found' });
      }
      
      res.json({ 
        success: true,
        data: procedure 
      });
    } catch (error) {
      console.error('Get procedure by ID error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /procedures:
   *   post:
   *     summary: Create a new procedure
   *     tags: [Procedures]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - category
   *             properties:
   *               name:
   *                 type: string
   *               category:
   *                 type: string
   *               description:
   *                 type: string
   *               is_active:
   *                 type: boolean
   *               display_order:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Procedure created successfully
   */
  static async create(req, res) {
    try {
      const procedure = await ProcedureModel.create(req.body);
      
      res.status(201).json({ 
        success: true,
        message: 'Procedure created successfully',
        data: procedure 
      });
    } catch (error) {
      console.error('Create procedure error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /procedures/{id}:
   *   put:
   *     summary: Update a procedure
   *     tags: [Procedures]
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
   *               name:
   *                 type: string
   *               category:
   *                 type: string
   *               description:
   *                 type: string
   *               is_active:
   *                 type: boolean
   *               display_order:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Procedure updated successfully
   */
  static async update(req, res) {
    try {
      const procedure = await ProcedureModel.update(req.params.id, req.body);
      
      if (!procedure) {
        return res.status(404).json({ error: 'Procedure not found' });
      }
      
      res.json({ 
        success: true,
        message: 'Procedure updated successfully',
        data: procedure 
      });
    } catch (error) {
      console.error('Update procedure error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * @swagger
   * /procedures/{id}:
   *   delete:
   *     summary: Delete a procedure
   *     tags: [Procedures]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Procedure deleted successfully
   */
  static async delete(req, res) {
    try {
      const procedure = await ProcedureModel.delete(req.params.id);
      
      if (!procedure) {
        return res.status(404).json({ error: 'Procedure not found' });
      }
      
      res.json({ 
        success: true,
        message: 'Procedure deleted successfully' 
      });
    } catch (error) {
      console.error('Delete procedure error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProcedureController;
