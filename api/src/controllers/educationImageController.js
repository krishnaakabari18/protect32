const path = require('path');

class EducationImageController {
  static async uploadInlineImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Get the relative path for the uploaded image
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      const imagePath = `education/${year}/${month}/${day}/${req.file.filename}`;
      const imageUrl = `/uploads/${imagePath}`;

      res.json({ 
        success: true,
        url: imageUrl,
        path: imagePath
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EducationImageController;
