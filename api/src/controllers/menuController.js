const MenuModel = require('../models/menuModel');

class MenuController {
  // Get all menus
  static async getAll(req, res) {
    try {
      const { is_active, parent_id } = req.query;
      
      const filters = {};
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (parent_id !== undefined) filters.parent_id = parent_id === 'null' ? null : parent_id;

      const menus = await MenuModel.findAll(filters);
      res.json({ success: true, data: menus });
    } catch (error) {
      console.error('Error fetching menus:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get menus for current user
  static async getMyMenus(req, res) {
    try {
      const userId = req.user.id;
      const menus = await MenuModel.findByUserId(userId);
      res.json({ success: true, data: menus });
    } catch (error) {
      console.error('Error fetching user menus:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get single menu
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const menu = await MenuModel.findById(id);
      
      if (!menu) {
        return res.status(404).json({ success: false, error: 'Menu not found' });
      }
      
      res.json({ success: true, data: menu });
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create menu
  static async create(req, res) {
    try {
      const { name, label, path, icon, parent_id, sort_order, is_active } = req.body;
      
      if (!name || !label || !path) {
        return res.status(400).json({ success: false, error: 'Name, label, and path are required' });
      }

      const menu = await MenuModel.create({ name, label, path, icon, parent_id, sort_order, is_active });
      res.status(201).json({ success: true, data: menu });
    } catch (error) {
      console.error('Error creating menu:', error);
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'Menu name already exists' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update menu
  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const menu = await MenuModel.update(id, data);
      
      if (!menu) {
        return res.status(404).json({ success: false, error: 'Menu not found' });
      }
      
      res.json({ success: true, data: menu });
    } catch (error) {
      console.error('Error updating menu:', error);
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'Menu name already exists' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete menu
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const menu = await MenuModel.delete(id);
      
      if (!menu) {
        return res.status(404).json({ success: false, error: 'Menu not found' });
      }
      
      res.json({ success: true, message: 'Menu deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get user permissions for all menus
  static async getUserPermissions(req, res) {
    try {
      const { userId } = req.params;
      const permissions = await MenuModel.getAllUserPermissions(userId);
      res.json({ success: true, data: permissions });
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update user permissions
  static async updateUserPermissions(req, res) {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ success: false, error: 'Permissions must be an array' });
      }

      await MenuModel.bulkUpdateUserPermissions(userId, permissions);
      res.json({ success: true, message: 'Permissions updated successfully' });
    } catch (error) {
      console.error('Error updating user permissions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = MenuController;
