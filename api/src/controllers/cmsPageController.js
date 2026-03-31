const CmsPageModel = require('../models/cmsPageModel');

// Auto-generate slug from title
const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

class CmsPageController {
  static async getAll(req, res) {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
      const pages = await CmsPageModel.findAll({ status, search });
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const start = (pageNum - 1) * limitNum;
      const paginated = pages.slice(start, start + limitNum);
      res.json({
        data: paginated,
        pagination: { page: pageNum, limit: limitNum, total: pages.length, totalPages: Math.ceil(pages.length / limitNum) },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const page = await CmsPageModel.findById(req.params.id);
      if (!page) return res.status(404).json({ error: 'CMS page not found' });
      res.json({ data: page });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { title, slug, content, meta_title, meta_description, status } = req.body;
      if (!title) return res.status(400).json({ error: 'Title is required' });

      const finalSlug = slug ? slug.trim() : toSlug(title);

      // Check slug uniqueness
      const existing = await CmsPageModel.findBySlug(finalSlug);
      if (existing) return res.status(400).json({ error: 'Slug already exists. Use a different title or slug.' });

      const page = await CmsPageModel.create({ title, slug: finalSlug, content, meta_title, meta_description, status });
      res.status(201).json({ message: 'CMS page created successfully', data: page });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { title, slug, content, meta_title, meta_description, status } = req.body;

      // If slug is being changed, check uniqueness
      if (slug) {
        const existing = await CmsPageModel.findBySlug(slug);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ error: 'Slug already exists.' });
        }
      }

      // Auto-update slug if title changed and no explicit slug provided
      const updateData = { title, slug, content, meta_title, meta_description, status };
      if (title && !slug) updateData.slug = toSlug(title);

      const page = await CmsPageModel.update(req.params.id, updateData);
      if (!page) return res.status(404).json({ error: 'CMS page not found' });
      res.json({ message: 'CMS page updated successfully', data: page });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      if (!['Published', 'Draft'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Published or Draft' });
      }
      const page = await CmsPageModel.updateStatus(req.params.id, status);
      if (!page) return res.status(404).json({ error: 'CMS page not found' });
      res.json({ message: `CMS page ${status.toLowerCase()} successfully`, data: page });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const page = await CmsPageModel.delete(req.params.id);
      if (!page) return res.status(404).json({ error: 'CMS page not found' });
      res.json({ message: 'CMS page deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = CmsPageController;
